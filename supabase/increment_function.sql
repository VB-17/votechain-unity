
-- Create a function to safely increment a value
CREATE OR REPLACE FUNCTION public.increment(row_id uuid, increment_amount integer) 
RETURNS integer
LANGUAGE sql 
SECURITY definer
AS $$
  UPDATE candidates
  SET votes_count = COALESCE(votes_count, 0) + increment_amount
  WHERE id = row_id
  RETURNING votes_count;
$$;
