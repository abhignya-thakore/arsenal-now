-- Create weather_reports table for daily fan sentiment reports
CREATE TABLE IF NOT EXISTS weather_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on report_date for fast lookups
CREATE INDEX IF NOT EXISTS idx_weather_reports_date ON weather_reports(report_date DESC);
