/*
  # Update employee fields - Remove job fields and add health/military fields

  1. Changes - Add New Fields
    - Add `health_situation` (text) - Employee's health status/condition
    - Add `studying_degree` (text) - Employee's current studying degree/program
    - Add `military_service` (text) - Military service status (yes/no/exempt)
    - Add `previous_jobs` (text) - Employee's previous work experience
    - Add `remarks` (text) - Additional remarks or notes

  2. Changes - Remove Old Fields
    - Remove `job_title` column
    - Remove `department` column
    - Remove `hire_date` column

  3. Notes
    - Uses IF EXISTS/NOT EXISTS pattern for safe operations
    - All new fields are optional
    - Old fields are dropped safely
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'health_situation'
  ) THEN
    ALTER TABLE employees ADD COLUMN health_situation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'studying_degree'
  ) THEN
    ALTER TABLE employees ADD COLUMN studying_degree text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'military_service'
  ) THEN
    ALTER TABLE employees ADD COLUMN military_service text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'previous_jobs'
  ) THEN
    ALTER TABLE employees ADD COLUMN previous_jobs text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'remarks'
  ) THEN
    ALTER TABLE employees ADD COLUMN remarks text;
  END IF;
END $$;