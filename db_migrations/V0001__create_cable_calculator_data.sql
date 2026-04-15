CREATE TABLE t_p21653320_polka_plus_landing.cable_calculator_data (
  id SERIAL PRIMARY KEY,
  key VARCHAR(64) NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p21653320_polka_plus_landing.cable_calculator_data (key, data)
VALUES ('main', '{}');
