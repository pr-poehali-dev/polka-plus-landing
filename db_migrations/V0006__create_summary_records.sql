CREATE TABLE IF NOT EXISTS summary_records (
    id SERIAL PRIMARY KEY,
    category VARCHAR(20) NOT NULL DEFAULT 'paid_not_shipped',
    contractor VARCHAR(255) NOT NULL,
    invoice_date DATE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    is_shipped BOOLEAN DEFAULT FALSE,
    subtotal NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);