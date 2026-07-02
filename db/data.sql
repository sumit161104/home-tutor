-- Seed Data for Home Tutor

-- Seed Subjects
INSERT INTO subjects (name) VALUES 
('Mathematics'),
('Science'),
('Physics'),
('Chemistry'),
('Biology'),
('English'),
('Hindi'),
('Social Studies'),
('Computer Science'),
('History'),
('Geography'),
('EVS')
ON CONFLICT (name) DO NOTHING;

-- Seed Standards (Classes)
INSERT INTO standards (class_name) VALUES 
('Class 1'),
('Class 2'),
('Class 3'),
('Class 4'),
('Class 5'),
('Class 6'),
('Class 7'),
('Class 8'),
('Class 9'),
('Class 10'),
('Class 11'),
('Class 12'),
('LKG'),
('UKG')
ON CONFLICT (class_name) DO NOTHING;
