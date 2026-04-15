-- Дебиторская задолженность (нам должны)
CREATE TABLE IF NOT EXISTS receivables (
    id SERIAL PRIMARY KEY,
    contractor VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Кредиторская задолженность (мы должны)
CREATE TABLE IF NOT EXISTS payables (
    id SERIAL PRIMARY KEY,
    contractor VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date DATE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Календарь платежей
CREATE TABLE IF NOT EXISTS payment_calendar (
    id SERIAL PRIMARY KEY,
    contractor VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'expense',
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Регулярные платежи
CREATE TABLE IF NOT EXISTS regular_payments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contractor VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    next_payment_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);