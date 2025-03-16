import { supabase } from './supabase'

/**
 * Creates the quizzes table in Supabase
 */
export async function createQuizzesTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by TEXT,
        category TEXT,
        difficulty TEXT,
        time_limit INTEGER,
        image_url TEXT
      );
    `
  })
  
  return { error }
}

/**
 * Creates the questions table in Supabase
 */
export async function createQuestionsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT,
        type TEXT,
        time_limit INTEGER
      );
    `
  })
  
  return { error }
}

/**
 * Creates the quiz_attempts table in Supabase
 */
export async function createQuizAttemptsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        score NUMERIC,
        total_questions INTEGER,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        time_spent INTEGER,
        answers JSONB
      );
    `
  })
  
  return { error }
}

/**
 * Checks if a table exists in the database
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      );
    `
  })
  
  if (error || !data || data.length === 0) {
    return false
  }
  
  return data[0].exists
}

/**
 * Flattens a quiz object for database insertion
 */
export function flattenQuiz(quiz: any) {
  const { questions, ...quizData } = quiz
  
  // Convert camelCase to snake_case for database
  return {
    id: quizData.id,
    title: quizData.title,
    description: quizData.description,
    created_at: quizData.createdAt,
    created_by: quizData.createdBy,
    category: quizData.category,
    difficulty: quizData.difficulty,
    time_limit: quizData.timeLimit,
    image_url: quizData.imageUrl
  }
}

/**
 * Flattens a question object for database insertion
 */
export function flattenQuestion(question: any, quizId: string) {
  return {
    id: question.id,
    quiz_id: quizId,
    question: question.question,
    options: question.options,
    correct_answer: question.correctAnswer,
    type: question.type,
    time_limit: question.timeLimit
  }
} 