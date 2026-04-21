CREATE TABLE IF NOT EXISTS pricing_rows (
  id TEXT PRIMARY KEY,
  cable_id TEXT NOT NULL,
  norm_hours NUMERIC,
  hour_rate NUMERIC,
  cost_price NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);