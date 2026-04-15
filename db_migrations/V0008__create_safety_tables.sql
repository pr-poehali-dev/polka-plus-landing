CREATE TABLE IF NOT EXISTS safety_employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    briefing BOOLEAN DEFAULT FALSE,
    ppe BOOLEAN DEFAULT FALSE,
    medical BOOLEAN DEFAULT FALSE,
    next_briefing DATE,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_checks (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_ppe (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    issued BOOLEAN DEFAULT FALSE,
    issued_at DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_docs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);