import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'
import { Quiz } from '@/types/quiz'

export const quizzes: Quiz[] = [
  {
    id: uuidv4(),
    title: "Personal Growth Fundamentals",
    description: "Test your knowledge about personal development concepts and strategies.",
    difficulty: "easy",
    timeLimit: 300, // 5 minutes
    createdAt: new Date().toISOString(),
    createdBy: "system",
    category: "Personal Development",
    questions: [
      {
        id: uuidv4(),
        question: "What is the primary purpose of setting SMART goals?",
        options: [
          "To impress others with ambitious targets",
          "To create specific, measurable, achievable, relevant, and time-bound objectives",
          "To avoid planning for the future",
          "To focus only on short-term achievements"
        ],
        correctAnswer: "To create specific, measurable, achievable, relevant, and time-bound objectives",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which of the following is NOT typically considered a component of emotional intelligence?",
        options: [
          "Self-awareness",
          "Social skills",
          "Technical expertise",
          "Empathy"
        ],
        correctAnswer: "Technical expertise",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is the 'growth mindset' concept developed by Carol Dweck?",
        options: [
          "The belief that intelligence and abilities are fixed traits",
          "The belief that intelligence and abilities can be developed through dedication and hard work",
          "The idea that growth is only possible during childhood",
          "The concept that personal growth requires external validation"
        ],
        correctAnswer: "The belief that intelligence and abilities can be developed through dedication and hard work",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which practice is most associated with mindfulness?",
        options: [
          "Multitasking",
          "Present moment awareness",
          "Future planning",
          "Competitive analysis"
        ],
        correctAnswer: "Present moment awareness",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is the Pomodoro Technique used for?",
        options: [
          "Cooking Italian food",
          "Time management and productivity",
          "Physical exercise",
          "Relationship building"
        ],
        correctAnswer: "Time management and productivity",
        timeLimit: 30,
        type: "mcq"
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Professional Communication Skills",
    description: "Evaluate your understanding of effective workplace communication.",
    difficulty: "medium",
    timeLimit: 360, // 6 minutes
    createdAt: new Date().toISOString(),
    createdBy: "system",
    category: "Communication",
    questions: [
      {
        id: uuidv4(),
        question: "What is active listening?",
        options: [
          "Interrupting to show engagement",
          "Fully concentrating, understanding, responding, and remembering what is being said",
          "Listening only to information relevant to your interests",
          "Multitasking while someone is speaking"
        ],
        correctAnswer: "Fully concentrating, understanding, responding, and remembering what is being said",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which of the following is an example of non-verbal communication?",
        options: [
          "Email",
          "Phone call",
          "Eye contact",
          "Text message"
        ],
        correctAnswer: "Eye contact",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is the primary purpose of constructive feedback?",
        options: [
          "To criticize someone's performance",
          "To help someone improve their performance",
          "To demonstrate authority",
          "To document performance issues"
        ],
        correctAnswer: "To help someone improve their performance",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which communication channel is most appropriate for delivering complex, sensitive information?",
        options: [
          "Email",
          "Text message",
          "Face-to-face conversation",
          "Group chat"
        ],
        correctAnswer: "Face-to-face conversation",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is the 'sandwich method' in feedback?",
        options: [
          "Providing feedback during lunch",
          "Starting and ending with positive comments, with constructive criticism in the middle",
          "Giving feedback to multiple people at once",
          "Alternating between positive and negative feedback points"
        ],
        correctAnswer: "Starting and ending with positive comments, with constructive criticism in the middle",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which of the following is a barrier to effective communication?",
        options: [
          "Active listening",
          "Clear messaging",
          "Emotional intelligence",
          "Making assumptions"
        ],
        correctAnswer: "Making assumptions",
        timeLimit: 30,
        type: "mcq"
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Leadership Principles",
    description: "Test your knowledge of effective leadership concepts and practices.",
    difficulty: "hard",
    timeLimit: 420, // 7 minutes
    createdAt: new Date().toISOString(),
    createdBy: "system",
    category: "Leadership",
    questions: [
      {
        id: uuidv4(),
        question: "What is transformational leadership?",
        options: [
          "Leadership focused on maintaining the status quo",
          "Leadership that motivates followers to exceed their own self-interests for the good of the group",
          "Leadership based solely on rewards and punishments",
          "Leadership that avoids making decisions"
        ],
        correctAnswer: "Leadership that motivates followers to exceed their own self-interests for the good of the group",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which of the following is NOT one of Daniel Goleman's six leadership styles?",
        options: [
          "Coercive",
          "Authoritative",
          "Transformational",
          "Democratic"
        ],
        correctAnswer: "Transformational",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is servant leadership?",
        options: [
          "A leadership philosophy where the leader's main goal is to serve others",
          "A leadership style where employees serve the leader",
          "A leadership approach focused on short-term results",
          "A leadership style that emphasizes strict hierarchy"
        ],
        correctAnswer: "A leadership philosophy where the leader's main goal is to serve others",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which leadership quality is most associated with building trust?",
        options: [
          "Technical expertise",
          "Consistency and integrity",
          "Charisma",
          "Decisiveness"
        ],
        correctAnswer: "Consistency and integrity",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is psychological safety in a team context?",
        options: [
          "Protecting team members from physical harm",
          "Ensuring team members feel comfortable taking risks without fear of negative consequences",
          "Providing therapy for team members",
          "Avoiding all forms of conflict"
        ],
        correctAnswer: "Ensuring team members feel comfortable taking risks without fear of negative consequences",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "Which leadership approach is best suited for crisis situations?",
        options: [
          "Laissez-faire leadership",
          "Democratic leadership",
          "Directive leadership",
          "Affiliative leadership"
        ],
        correctAnswer: "Directive leadership",
        timeLimit: 30,
        type: "mcq"
      },
      {
        id: uuidv4(),
        question: "What is the primary focus of situational leadership?",
        options: [
          "Adapting leadership style based on the situation and followers' needs",
          "Maintaining a consistent leadership approach regardless of circumstances",
          "Focusing exclusively on task completion",
          "Emphasizing relationship building over results"
        ],
        correctAnswer: "Adapting leadership style based on the situation and followers' needs",
        timeLimit: 30,
        type: "mcq"
      }
    ]
  }
]

export async function seedQuizzes() {
  try {
    // First, check if quizzes already exist to avoid duplicates
    const { data: existingQuizzes } = await supabase
      .from('quizzes')
      .select('id')
    
    if (existingQuizzes && existingQuizzes.length > 0) {
      console.log('Quizzes already exist in the database. Skipping seed.')
      return
    }
    
    // Insert quizzes
    const { error } = await supabase
      .from('quizzes')
      .insert(quizzes)
    
    if (error) {
      throw error
    }
    
    console.log('Successfully seeded quizzes!')
  } catch (error) {
    console.error('Error seeding quizzes:', error)
  }
} 