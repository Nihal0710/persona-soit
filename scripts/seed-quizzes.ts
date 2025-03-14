import { seedQuizzes } from '../lib/seed-data'

async function main() {
  console.log('Starting to seed quizzes...')
  await seedQuizzes()
  console.log('Seeding completed!')
}

main().catch(error => {
  console.error('Error seeding quizzes:', error)
  process.exit(1)
}) 