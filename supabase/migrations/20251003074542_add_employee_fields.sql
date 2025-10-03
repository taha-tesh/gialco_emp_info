/*
  # Add additional employee fields

  1. Changes
    - Add `national_id` (text) - Employee's national ID number
    - Add `phone_number` (text) - Employee's phone number
    - Add `email` (text) - Employee's email address
    - Add `address` (text) - Employee's residential address
    - Add `job_title` (text) - Employee's job title/position
    - Add `department` (text) - Employee's department
    - Add `hire_date` (date) - Employee's date of hire
    - Add `education_level` (text) - Employee's education level

  2. Notes
    - Uses IF NOT EXISTS pattern to safely add columns
    - All new fields are optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'national_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN national_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE employees ADD COLUMN phone_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'email'
  ) THEN
    ALTER TABLE employees ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'address'
  ) THEN
    ALTER TABLE employees ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE employees ADD COLUMN job_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'department'
  ) THEN
    ALTER TABLE employees ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'hire_date'
  ) THEN
    ALTER TABLE employees ADD COLUMN hire_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'education_level'
  ) THEN
    ALTER TABLE employees ADD COLUMN education_level text;
  END IF;
END $$;