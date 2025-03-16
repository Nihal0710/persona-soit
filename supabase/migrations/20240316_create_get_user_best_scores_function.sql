-- Create a function to get a user's best scores for each quiz
CREATE OR REPLACE FUNCTION get_user_best_scores(user_id_param UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  quiz_id UUID,
  score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      qa.quiz_id,
      qa.score,
      qa.completed_at,
      ROW_NUMBER() OVER (PARTITION BY qa.quiz_id ORDER BY qa.score DESC) as rank
    FROM 
      quiz_attempts qa
    WHERE
      qa.user_id = user_id_param
  )
  SELECT 
    rs.quiz_id,
    rs.score,
    rs.completed_at
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