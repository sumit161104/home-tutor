-- Database Schema for Home Tutor

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS tutor_standards CASCADE;
DROP TABLE IF EXISTS standards CASCADE;
DROP TABLE IF EXISTS tutor_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS availabilities CASCADE;
DROP TABLE IF EXISTS tutor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'GUARDIAN' or 'TUTOR'
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TutorProfile Table
CREATE TABLE tutor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    qualification VARCHAR(255),
    experience INTEGER, -- in years
    fees NUMERIC(10, 2),
    city VARCHAR(100),
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    teaching_mode VARCHAR(50), -- 'ONLINE', 'OFFLINE', 'BOTH'
    about TEXT,
    CONSTRAINT fk_tutor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Availability Table
CREATE TABLE availabilities (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL,
    day VARCHAR(20) NOT NULL, -- 'MONDAY', 'TUESDAY', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT fk_availability_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE
);

-- 4. Subject Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 5. TutorSubject Mapping Table
CREATE TABLE tutor_subjects (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    CONSTRAINT fk_tutor_subject_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_subject_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_subject UNIQUE (tutor_id, subject_id)
);

-- 6. Standard Table
CREATE TABLE standards (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) UNIQUE NOT NULL
);

-- 7. TutorStandard Mapping Table
CREATE TABLE tutor_standards (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL,
    standard_id INTEGER NOT NULL,
    CONSTRAINT fk_tutor_standard_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_standard_standard FOREIGN KEY (standard_id) REFERENCES standards(id) ON DELETE CASCADE,
    CONSTRAINT uq_tutor_standard UNIQUE (tutor_id, standard_id)
);
