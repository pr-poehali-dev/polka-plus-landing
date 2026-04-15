CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    contractor VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);