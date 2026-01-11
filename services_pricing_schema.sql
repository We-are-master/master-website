-- Services and Pricing Schema for Master B2C Platform
-- This table stores all available services with their pricing information

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'Quick Fix', 'Multi Task', 'Standard', 'Insurance', 'Materials'
  category TEXT NOT NULL, -- 'Handyman', 'Plumbing/Electrician', 'Electrician', 'Carpenter', 'Painter'
  service_name TEXT NOT NULL,
  description TEXT,
  master_price DECIMAL(10, 2) NOT NULL, -- Price in GBP
  unit TEXT, -- 'Hourly', 'Per m²', 'Per room', 'Per day', 'Per point', 'Up to 20 items', etc.
  duration TEXT, -- '1-3 hours', '4-5 Hours', 'Full day', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- Insert services data
INSERT INTO services (type, category, service_name, description, master_price, unit, duration) VALUES

-- Handyman Services
('Quick Fix', 'Handyman', 'Hourly Rate (Labour Only)', 'Hourly', 65.00, 'Hourly', '1 hour'),
('Multi Task', 'Handyman', 'Half Day (Labour Only)', '4-5 Hours', 145.00, 'Half Day', '4-5 Hours'),
('Multi Task', 'Handyman', 'Day Rate (Labour Only)', 'Full day', 290.00, 'Day', 'Full day'),

-- Plumbing/Electrician Services
('Quick Fix', 'Plumbing/Electrician', 'Hourly Rate (Labour Only)', 'Repair', 72.00, 'Hourly', '1 hour'),
('Standart', 'Plumbing/Electrician', 'Half Day (Labour Only)', '4-5 Hours', 200.00, 'Half Day', '4-5 Hours'),
('Standart', 'Plumbing/Electrician', 'Day Rate (Labour Only)', 'Standard', 350.00, 'Day', 'Full day'),

-- Electrician Specific Services
('Standard', 'Electrician', 'EICR Test', '1-3 Bed Property', 208.33, 'Per property', '1-3 Bed Property'),
('Standard', 'Electrician', 'PAT Test', 'Up to 20 items', 100.00, 'Up to 20 items', 'Up to 20 items'),
('Standard', 'Electrician', 'Light Fitting', 'Per point', 75.00, 'Per point', 'Per point'),

-- Carpenter Services
('Quick Fix', 'Carpenter', 'Small Jobs (Labour Only)', 'up to 2 hours', 72.00, 'Job', 'up to 2 hours'),
('Multi Task', 'Carpenter', 'Half Day (Labour Only)', 'between 4-5 Hours', 180.00, 'Half Day', 'between 4-5 Hours'),
('Multi Task', 'Carpenter', 'Full Day (Labour Only)', '7 Hours', 360.00, 'Day', '7 Hours'),
('Standard', 'Carpenter', 'Door Installation (Labour Only)', 'External', 300.00, 'Per door', 'External'),
('Standard', 'Carpenter', 'Door Installation (Labour Only)', 'Standard', 170.00, 'Per door', 'Standard'),
('Standard', 'Carpenter', 'Door Installation (Labour Only)', 'Fire Door', 200.00, 'Per door', 'Fire Door'),
('Standard', 'Carpenter', 'Door Ins + Handle + Hinge (Labour Only)', 'Standard', 200.00, 'Per door', 'Standard'),
('Standard', 'Carpenter', 'Door Ins + Handle + Hinge (Labour Only)', 'Fire Door', 245.00, 'Per door', 'Fire Door'),
('Standard', 'Carpenter', 'HMO Approved (Labour Only)', 'Fire Door', 275.00, 'Per door', 'Fire Door'),
('Standard', 'Carpenter', 'Frame Installation (Labour Only)', 'Standard', 110.00, 'Per frame', 'Standard'),
('Standard', 'Carpenter', 'Frame Installation (Labour Only)', 'Fire Door', 110.00, 'Per frame', 'Fire Door'),
('Standard', 'Carpenter', 'Bolt Installation (Labour Only)', 'Standard up to 2', 45.00, 'Up to 2 bolts', 'Standard up to 2'),
('Standard', 'Carpenter', 'Bolt Installation (Labour Only)', 'Fire Door up to 2', 45.00, 'Up to 2 bolts', 'Fire Door up to 2'),
('Standard', 'Carpenter', 'Change Hinges up to 3 (Labour Only)', 'Standard', 45.00, 'Up to 3 hinges', 'Standard'),
('Standard', 'Carpenter', 'Change Hinges up to 3 (Labour Only)', 'Fire Door', 45.00, 'Up to 3 hinges', 'Fire Door'),
('Standard', 'Carpenter', 'Flooring Fitting cost (Labour Only)', 'Per m²', 30.00, 'Per m²', 'Per m²'),
('Standard', 'Carpenter', 'Flooring Fitting cost (Labour Only)', 'Per day', 290.00, 'Per day', 'Per day'),
('Standard', 'Carpenter', 'Flooring Fitting cost (Labour Only)', 'Per room', 450.00, 'Per room', 'Per room'),
('Standard', 'Carpenter', 'Flooring Underlay (Labour Only)', 'Per m²', 7.50, 'Per m²', 'Per m²'),
('Standard', 'Carpenter', 'New skirting boards (Labour Only)', 'Per m²', 22.00, 'Per m²', 'Per m²'),
('Standard', 'Carpenter', 'Carpet removal (Labour Only)', 'Per m²', 7.00, 'Per m²', 'Per m²'),
('Standard', 'Carpenter', 'Carpet removal (Labour Only)', 'Per room', 125.00, 'Per room', 'Per room'),

-- Painter Services
('Quick Fix', 'Painter', 'Hourly Rate (Labour Only)', 'Hourly', 72.00, 'Hourly', '1 hour'),
('Multi Task', 'Painter', 'Half Day (Labour Only)', '4-5 Hours', 175.00, 'Half Day', '4-5 Hours'),
('Multi Task', 'Painter', 'Day Rate (Labour Only)', 'Full day', 250.00, 'Day', 'Full day'),

-- Materials (Carpenter)
('Materials', 'Carpenter', 'External Door', 'Wood Door', 400.00, 'Per door', NULL),
('Materials', 'Carpenter', 'Door Installation', 'Standard', 100.00, 'Per door', 'Standard'),
('Materials', 'Carpenter', 'Door Installation', 'Fire Door', 150.00, 'Per door', 'Fire Door'),
('Materials', 'Carpenter', 'Hinges', 'Standard', 17.99, 'Per set', 'Standard'),
('Materials', 'Carpenter', 'Hinges', 'Fire', 24.99, 'Per set', 'Fire'),
('Materials', 'Carpenter', 'Handle', 'Standard', 24.99, 'Per handle', 'Standard'),
('Materials', 'Carpenter', 'Handle', 'Fire', 18.99, 'Per handle', 'Fire'),
('Materials', 'Carpenter', 'Bolt', 'Standard', 29.99, 'Per bolt', 'Standard'),
('Materials', 'Carpenter', 'Bolt', 'Fire', 39.99, 'Per bolt', 'Fire');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE services IS 'Stores all available services with pricing information for Master B2C platform';
COMMENT ON COLUMN services.type IS 'Service type: Quick Fix, Multi Task, Standard, Insurance, Materials';
COMMENT ON COLUMN services.category IS 'Service category: Handyman, Plumbing/Electrician, Electrician, Carpenter, Painter';
COMMENT ON COLUMN services.master_price IS 'Master service price in GBP';
COMMENT ON COLUMN services.unit IS 'Pricing unit: Hourly, Per m², Per room, Per day, etc.';
COMMENT ON COLUMN services.duration IS 'Expected duration or scope of the service';
