// @ts-nocheck
/// <reference types="jsr:@supabase/functions-js/edge-runtime" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const googleServiceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const googleServiceAccountPrivateKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
    const googleSheetsId = Deno.env.get("GOOGLE_SHEETS_ID");
    const googleSheetsTabName = Deno.env.get("GOOGLE_SHEETS_TAB_NAME") || "Sheet1";

    const { employeeId } = await req.json();

    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .maybeSingle();

    if (error || !employee) {
      throw new Error("Employee not found");
    }

    const excelRow = [
      employee.full_name || "",
      employee.national_id || "",
      employee.birth_date || "",
      employee.sex || "",
      employee.marital_status || "",
      employee.number_of_children?.toString() || "0",
      employee.phone_number || "",
      employee.email || "",
      employee.address || "",
      employee.health_situation || "",
      employee.studying_degree || "",
      employee.education_level || "",
      employee.military_service || "",
      employee.previous_jobs || "",
      employee.remarks || "",
      new Date(employee.created_at).toISOString(),
    ];
    // If Google Sheets env vars are configured, append to the sheet; otherwise fallback to success without Sheets
    if (googleServiceAccountEmail && googleServiceAccountPrivateKey && googleSheetsId) {
      // Acquire OAuth2 access token via service account JWT
      const token = await getGoogleAccessToken({
        clientEmail: googleServiceAccountEmail,
        privateKeyPem: googleServiceAccountPrivateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const range = encodeURIComponent(`${googleSheetsTabName}!A:Z`);
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

      const appendRes = await fetch(appendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [excelRow] }),
      });

      if (!appendRes.ok) {
        const errorText = await appendRes.text();
        throw new Error(`Google Sheets append failed: ${appendRes.status} ${errorText}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "تم إرسال البيانات بنجاح إلى Google Sheets" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Helpers
function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\r?\n/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPrivateKeyPKCS8(privateKeyPem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(privateKeyPem);
  return crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function getGoogleAccessToken(params: {
  clientEmail: string;
  privateKeyPem: string;
  scopes: string[];
}): Promise<string> {
  const { clientEmail, privateKeyPem, scopes } = params;
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`;
  const key = await importPrivateKeyPKCS8(privateKeyPem);
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      new TextEncoder().encode(unsigned)
    )
  );
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Google access token: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.access_token as string;
}
