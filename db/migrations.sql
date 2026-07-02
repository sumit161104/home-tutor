-- Database Migrations for Home Tutor Extensions

-- 1. Add verification flag to tutor_profiles
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Create Tutor Verifications Table
CREATE TABLE IF NOT EXISTS tutor_verifications (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER UNIQUE NOT NULL,
    id_proof_url VARCHAR(255),
    degree_proof_url VARCHAR(255),
    background_check_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    rejection_reason TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE
);

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_guardian FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_guardian_review UNIQUE (tutor_id, guardian_id)
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_guardian FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'RESOLVED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE
);

-- 6. Add account approval flag to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
-- Approve all existing users so they don't get locked out
UPDATE users SET is_approved = TRUE;
