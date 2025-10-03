import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Employee = {
  id: string;
  created_at: string;
  full_name: string | null;
  national_id: string | null;
  birth_date: string | null;
  sex: string | null;
  marital_status: string | null;
  number_of_children: number | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  health_situation: string | null;
  studying_degree: string | null;
  education_level: string | null;
  military_service: string | null;
  previous_jobs: string | null;
  remarks: string | null;
};

export function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('admin_authorized');
    if (cached === 'true') {
      setAuthorized(true);
      return;
    }
    const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
    const input = prompt('أدخل كلمة المرور للدخول إلى صفحة الإدارة:');
    if (expected && input === expected) {
      setAuthorized(true);
      localStorage.setItem('admin_authorized', 'true');
    } else {
      alert('كلمة المرور غير صحيحة.');
      setAuthorized(false);
    }
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEmployees(data as Employee[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchEmployees();
    }
  }, [authorized]);

  const headers = useMemo(
    () => [
      'الاسم الكامل',
      'رقم الهوية',
      'تاريخ الميلاد',
      'الجنس',
      'الحالة الاجتماعية',
      'عدد الأطفال',
      'رقم الهاتف',
      'البريد الإلكتروني',
      'العنوان',
      'الحالة الصحية',
      'التخصص الدراسي',
      'المستوى التعليمي',
      'الخدمة العسكرية',
      'الوظائف السابقة',
      'ملاحظات',
      'تاريخ الإنشاء'
    ],
    []
  );

  const downloadCsv = () => {
    const rows = employees.map((e) => [
      e.full_name ?? '',
      e.national_id ?? '',
      e.birth_date ?? '',
      e.sex ?? '',
      e.marital_status ?? '',
      (e.number_of_children ?? 0).toString(),
      e.phone_number ?? '',
      e.email ?? '',
      e.address ?? '',
      e.health_situation ?? '',
      e.studying_degree ?? '',
      e.education_level ?? '',
      e.military_service ?? '',
      e.previous_jobs ?? '',
      e.remarks ?? '',
      new Date(e.created_at).toISOString(),
    ]);

    const escape = (s: string) => '"' + s.replace(/"/g, '""') + '"';
    const csv = [headers, ...rows].map((r) => r.map((c) => escape(String(c))).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!authorized) {
    return (
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 text-center" dir="rtl">
        <p className="text-gray-700">غير مصرح بالدخول.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة - بيانات الموظفين</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEmployees}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
          <button
            onClick={downloadCsv}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            disabled={employees.length === 0}
          >
            تنزيل CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
      )}

      <div className="overflow-auto border border-gray-200 rounded-xl">
        <table className="min-w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">{e.full_name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.national_id}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.birth_date}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.sex}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.marital_status}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.number_of_children}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.phone_number}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.email}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.address}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.health_situation}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.studying_degree}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.education_level}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.military_service}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.previous_jobs}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.remarks}</td>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {employees.length === 0 && !loading && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={headers.length}>لا توجد بيانات حتى الآن</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


