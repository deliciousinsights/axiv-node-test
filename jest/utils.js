import { openDbConnections, syncModels } from '@axiv/backend-core/helpers'
import { Organization, Person, User, UserOrgRole } from '@axiv/backend-core'
import request from 'supertest'

import app from '../src/app.js'
import Question from '../src/models/Question.js'
import Quiz from '../src/models/Quiz.js'

const client = request(app)

beforeAll(async () => {
  try {
    await openDbConnections()
    await syncModels({ overrideForce: true })
    await masterUser()
  } catch (err) {
    console.error('OOOOOPS, ISSUE SETTING THIS UP!')
    console.error(err)
  }
})

// Public helpers
// --------------

const ORG_CODE = 'AA'

async function masterUser() {
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
    code: ORG_CODE,
    description: 'My Cool Organization',
  })

  await UserOrgRole.create({
    user_id: user.id,
    organization_id: org.id,
    role_key: 'Admin',
  })

  return user
}

function login() {
  return client.post('/auth/login').send({
    email: 'admin@example.com',
    password: '123',
  })
}

async function seedCorpus(quizMap) {
  try {
    await Quiz.sequelize.query('SET FOREIGN_KEY_CHECKS=0')
    await Quiz.destroy({ truncate: true, cascade: true, restartIdentity: true })
    // await Question.destroy({ truncate: true, restartIdentity: true })
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    await Quiz.sequelize.query('SET FOREIGN_KEY_CHECKS=1')
  }

  // This is intentionally sequenced, to guarantee ID ordering.
  for (const [title, questions] of Object.entries(quizMap)) {
    await seedQuiz({ title, questions })
  }
}

async function seedQuestion({ quiz, quizId, category, title }) {
  quiz ??= await Quiz.findByPk(quizId)
  return quiz.createQuestion({
    category,
    title,
    answers: ['yes', 'no'],
    correctAnswer: 'yes',
  })
}

async function seedQuiz({ title, questions }) {
  const quiz = await Quiz.create({ title })

  // This is intentionally sequenced, to guarantee ID ordering.
  for (const question of questions) {
    await seedQuestion({ quiz, ...question })
  }

  return quiz
}

export { client, login, masterUser, ORG_CODE, seedCorpus, seedQuestion }
