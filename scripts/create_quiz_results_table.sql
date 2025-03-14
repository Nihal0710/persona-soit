-- Create the quiz_results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_spent INTEGER,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting results
CREATE POLICY "Users can insert their own quiz results" 
ON public.quiz_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for reading results
CREATE POLICY "Users can read their own quiz results" 
ON public.quiz_results FOR SELECT 
USING (auth.uid() = user_id); 