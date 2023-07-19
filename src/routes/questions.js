import { ensureEntity } from '../helpers.js'
import Question from '../models/Question.js'
import Quiz from '../models/Quiz.js'

export default function initRoutes(app) {
  app.post('/quizzes/:id/questions', addQuizQuestion)
  app.get('/questions', listQuestions)
  app.get('/questions/:id', getQuestion)
  app.delete('/questions/:id', removeQuestion)
}

// Route handlers
// --------------

async function addQuizQuestion(req, res) {
  const quiz = await ensureEntity(Quiz, req.params.id, 'quiz')

  const payloads = Array.isArray(req.body) ? req.body : [req.body]
  // const results = []
  // for (const payload of payloads) {
  //   const { title, category, answers, correctAnswer } = payload
  //   const question = await quiz.createQuestion({
  //     title,
  //     category,
  //     answers,
  //     correctAnswer,
  //   })
  //   results.push(question.id)
  // }
  const results = await Promise.all(
    payloads.map(({ title, category, answers, correctAnswer }) =>
      quiz.createQuestion({ title, category, answers, correctAnswer })
    )
  )

  res.status(201).json(results.map(({ id }) => id))
}

async function getQuestion(req, res) {
  const question = await ensureEntity(Question, req.params.id, 'question')
  res.json(question)
}

async function listQuestions(req, res) {
  const questions = await Question.findAll({ order: ['category', 'title'] })
  res.json(questions)
}

async function removeQuestion(req, res) {
  const question = await ensureEntity(Question, req.params.id, 'question')

  await question.destroy()
  res.json({ status: 'successful removal' })
}
