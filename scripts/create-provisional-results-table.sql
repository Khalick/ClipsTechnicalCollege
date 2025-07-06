-- Create provisional_results table
CREATE TABLE IF NOT EXISTS public.provisional_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    semester VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    marks INTEGER CHECK (marks >= 0 AND marks <= 100),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024/2025',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provisional_results_student_id ON public.provisional_results(student_id);
CREATE INDEX IF NOT EXISTS idx_provisional_results_semester ON public.provisional_results(semester);

-- Insert sample data
INSERT INTO public.provisional_results (student_id, unit_id, semester, grade, marks, academic_year) 
SELECT 
    s.id,
    u.id,
    'Semester 1',
    CASE 
        WHEN random() > 0.8 THEN 'A'
        WHEN random() > 0.6 THEN 'B'
        WHEN random() > 0.4 THEN 'C'
        WHEN random() > 0.2 THEN 'D'
        ELSE 'F'
    END,
    (random() * 40 + 60)::INTEGER,
    '2024/2025'
FROM public.students s
CROSS JOIN public.units u
WHERE s.registration_number LIKE 'STU%'
LIMIT 20;