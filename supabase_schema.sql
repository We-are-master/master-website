-- Create requests table with zoho_id as required field
-- Note: zoho_id can be empty initially and will be updated later
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoho_id TEXT NOT NULL DEFAULT '', -- Empty by default, will be updated later
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL, -- e.g., 'Plumbing', 'Electrical', 'Cleaning', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  assigned_to TEXT, -- Name of the person assigned
  location TEXT,
  requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  cost DECIMAL(10, 2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on zoho_id for faster lookups (only for non-empty values)
-- This allows multiple empty strings but ensures uniqueness when zoho_id is set
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_zoho_id 
ON requests(zoho_id) 
WHERE zoho_id != '' AND zoho_id IS NOT NULL;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own requests
CREATE POLICY "Users can view their own requests"
    ON requests FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own requests
CREATE POLICY "Users can insert their own requests"
    ON requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own requests
CREATE POLICY "Users can update their own requests"
    ON requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Optional: If you want admins to see all requests, create this policy
-- CREATE POLICY "Admins can view all requests"
--     ON requests FOR SELECT
--     USING (
--       EXISTS (
--         SELECT 1 FROM users
--         WHERE users.id = auth.uid()
--         AND users.role = 'admin'
--       )
--     );

