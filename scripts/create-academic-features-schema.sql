-- Academic Features Database Schema
-- This script creates the necessary tables for academic features in the student portal

-- Create provisional_results table
CREATE TABLE IF NOT EXISTS provisional_results (
    id BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    marks INTEGER NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE
);

-- Create lecturer_evaluations table
CREATE TABLE IF NOT EXISTS lecturer_evaluations (
    id BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    lecturer_name VARCHAR(255) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(20) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    evaluation_status VARCHAR(20) DEFAULT 'pending',
    evaluation_active BOOLEAN DEFAULT TRUE,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    evaluation_submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE
);

-- Create academic_requisitions table
CREATE TABLE IF NOT EXISTS academic_requisitions (
    id BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    requisition_type VARCHAR(50) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    copies_requested INTEGER DEFAULT 1,
    delivery_method VARCHAR(20) DEFAULT 'collection',
    notes TEXT,
    fee_amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_date TIMESTAMP WITH TIME ZONE,
    collection_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provisional_results_reg_number ON provisional_results(registration_number);
CREATE INDEX IF NOT EXISTS idx_provisional_results_academic_year ON provisional_results(academic_year);
CREATE INDEX IF NOT EXISTS idx_lecturer_evaluations_reg_number ON lecturer_evaluations(registration_number);
CREATE INDEX IF NOT EXISTS idx_lecturer_evaluations_status ON lecturer_evaluations(evaluation_status);
CREATE INDEX IF NOT EXISTS idx_academic_requisitions_reg_number ON academic_requisitions(registration_number);
CREATE INDEX IF NOT EXISTS idx_academic_requisitions_status ON academic_requisitions(status);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE provisional_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_requisitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for provisional_results
CREATE POLICY "Students can view own provisional results" ON provisional_results
    FOR SELECT USING (registration_number = current_setting('app.current_user_reg_number', true));

-- Create RLS policies for lecturer_evaluations
CREATE POLICY "Students can view own lecturer evaluations" ON lecturer_evaluations
    FOR SELECT USING (registration_number = current_setting('app.current_user_reg_number', true));

-- Create RLS policies for academic_requisitions
CREATE POLICY "Students can view own academic requisitions" ON academic_requisitions
    FOR SELECT USING (registration_number = current_setting('app.current_user_reg_number', true));

CREATE POLICY "Students can insert own academic requisitions" ON academic_requisitions
    FOR INSERT WITH CHECK (registration_number = current_setting('app.current_user_reg_number', true));

-- Grant necessary permissions
GRANT SELECT, INSERT ON provisional_results TO authenticated;
GRANT SELECT, INSERT ON lecturer_evaluations TO authenticated;
GRANT SELECT, INSERT ON academic_requisitions TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provisional_results_updated_at BEFORE UPDATE ON provisional_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturer_evaluations_updated_at BEFORE UPDATE ON lecturer_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_requisitions_updated_at BEFORE UPDATE ON academic_requisitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments to tables
COMMENT ON TABLE provisional_results IS 'Stores provisional academic results for students';
COMMENT ON TABLE lecturer_evaluations IS 'Stores lecturer evaluation records and status';
COMMENT ON TABLE academic_requisitions IS 'Stores academic document requisition requests';

-- Display completion message
SELECT 'Academic features database schema has been successfully created!' AS message;
