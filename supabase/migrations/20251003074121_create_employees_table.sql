/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key) - Unique identifier for each employee
      - `full_name` (text) - Employee's full name
      - `birth_date` (date) - Employee's date of birth
      - `sex` (text) - Employee's sex (Male/Female)
      - `marital_status` (text) - Marital status (Single/Married)
      - `number_of_children` (integer) - Number of children (only applicable if married)
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `employees` table
    - Add policy for public insert access (anyone can submit employee information)
    - Add policy for public select access (anyone can view employee information)

  Note: This is a simple implementation. In production, you would want stricter access controls.
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birth_date date NOT NULL,
  sex text NOT NULL,
  marital_status text NOT NULL,
  number_of_children integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert employee information"
  ON employees
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view employee information"
  ON employees
  FOR SELECT
  TO anon
  USING (true);