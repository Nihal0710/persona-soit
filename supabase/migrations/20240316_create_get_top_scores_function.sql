-- Create a function to get top scores from quiz_attempts
CREATE OR REPLACE FUNCTION get_top_scores(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      qa.user_id,
      qa.score,
      qa.completed_at,
      qa.time_spent,
      ROW_NUMBER() OVER (PARTITION BY qa.user_id ORDER BY qa.score DESC) as rank
    FROM 
      quiz_attempts qa
  )
  SELECT 
    rs.user_id,
    rs.score,
    rs.completed_at,
    rs.time_spent
  FROM 
    ranked_scores rs
  WHERE 
    rs.rank = 1
  ORDER BY 
    rs.score DESC
  LIMIT 
    limit_count;
END;
$$; 