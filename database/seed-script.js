import { openDbConnections, syncModels } from '@axiv/backend-core/helpers'
import { Organization, Person, User, UserOrgRole } from '@axiv/backend-core'

import Question from '../src/models/Question.js'
import Quiz from '../src/models/Quiz.js'

await openDbConnections()
await syncModels({ overrideForce: true })
await seedAuth()
await seedCorpus()
console.log('Done seeding data, exiting…')
process.exit(0)

async function seedAuth() {
  console.log('🔐 Seeding auth…')
  await User.destroy({ where: {} })
  await Organization.destroy({ where: {} })

  const user = await User.create({
    email: 'admin@example.com',
    password: '123',
    password_creation_date: new Date(),
    last_request_date: new Date(0),
  })

  await Person.create({
    user_id: user.id,
    civility: 'Mr',
    first_name: 'John',
    last_name: 'Smith',
  })

  const org = await Organization.create({
    code: 'AA',
    description: 'My Cool Organization',
  })

  await UserOrgRole.create({
    user_id: user.id,
    organization_id: org.id,
    role_key: 'Admin',
  })

  return user
}

async function seedCorpus() {
  const quizzes = await seedQuizzes()

  const res = await fetch(
    'https://opentdb.com/api.php?amount=20&difficulty=easy&type=multiple'
  )
  const { results: questions } = await res.json()
  await seedQuestions({ quizzes, questions })
  return quizzes
}

async function seedQuestions({ quizzes, questions }) {
  console.log('❓ Seeding questions…')
  await Question.destroy({ where: {} })

  const creations = questions.map(
    ({
      category,
      question: title,
      incorrect_answers: incorrectAnswers,
      correct_answer: correctAnswer,
    }) => {
      const answers = [...incorrectAnswers, correctAnswer]
      answers.sort(Math.random)
      const quizId = quizzes[Math.floor(quizzes.length * Math.random())].id
      return Question.create({
        category,
        quizId,
        title,
        answers,
        correctAnswer,
      })
    }
  )

  return Promise.all(creations)
}

async function seedQuizzes(questions) {
  console.log('📝 Seeding quizzes…')
  await Quiz.destroy({ where: {} })

  const creations = [
    'An amazing quiz',
    'A wonderful quiz',
    'The quiz you never knew you wanted',
    'Some kick-ass quiz',
    'That dreadful quiz from hell',
  ].map((title) => Quiz.create({ title }))

  return Promise.all(creations)
}
