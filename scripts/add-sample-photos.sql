-- Update students with sample photo URLs
-- This script adds sample photo URLs to existing students

-- Update photo URLs for existing students
UPDATE students 
SET photo_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
WHERE registration_number = 'STU001';

UPDATE students 
SET photo_url = 'https://images.unsplash.com/photo-1494790108755-2616b9a2f7bb?w=150&h=150&fit=crop&crop=face'
WHERE registration_number = 'STU002';

UPDATE students 
SET photo_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
WHERE registration_number = 'CS001';

UPDATE students 
SET photo_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
WHERE registration_number = 'CS002';

UPDATE students 
SET photo_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
WHERE registration_number = 'CS003';

-- For any other existing students, set a placeholder photo
UPDATE students 
SET photo_url = '/placeholder-user.jpg'
WHERE photo_url IS NULL;

-- Display updated records
SELECT registration_number, name, photo_url FROM students WHERE photo_url IS NOT NULL;
