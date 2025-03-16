-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exec_sql function for executing dynamic SQL
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL Error: %', SQLERRM;
END;
$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  category TEXT,
  difficulty TEXT,
  time_limit INTEGER,
  image_url TEXT
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT,
  type TEXT,
  time_limit INTEGER
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC,
  total_questions INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent INTEGER,
  answers JSONB
);

-- Create function to get user's best scores
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

-- Create function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  total_score NUMERIC,
  quizzes_completed INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(SUM(qa.score), 0) as total_score,
    COUNT(DISTINCT qa.quiz_id) as quizzes_completed
  FROM
    profiles p
  LEFT JOIN
    quiz_attempts qa ON p.id = qa.user_id
  GROUP BY
    p.id, p.full_name, p.avatar_url
  ORDER BY
    total_score DESC, quizzes_completed DESC
  LIMIT
    limit_count;
END;
$$;

-- Create trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Quizzes: Everyone can view quizzes
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes
  FOR SELECT USING (true);

-- Questions: Everyone can view questions
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

-- Quiz attempts: Users can view and create their own attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id); 