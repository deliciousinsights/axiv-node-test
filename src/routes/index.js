import { AxivError } from '@axiv/backend-core/helpers'

import Question from '../models/Question.js'
import Quiz from '../models/Quiz.js'

export default function initRoutes(app) {
  app.get('/healthcheck', healthCheck)

  app.get('/quizzes', listQuizzes)
  app.get('/quizzes/:mode(singlecat|multicat)', listQuizzesForCategoryMode)
  app.get('/quizzes/:id', getQuiz)

  app.post('/quizzes/:id/questions', addQuizQuestion)
  app.get('/questions', listQuestions)
  app.get('/questions/:id', getQuestion)
  app.delete('/questions/:id', removeQuestion)
}

// Route handlers
// --------------

function healthCheck(req, res) {
  res.send({ status: '👌🏻', message: "We're all fine here!" })
}

async function addQuizQuestion(req, res) {
  const quiz = await Quiz.findByPk(req.params.id)
  if (!quiz) {
    throw new AxivError({ message: 'Cannot find this quiz.', code: 404 })
  }

  const payloads = Array.isArray(req.body) ? req.body : [req.body]
  const results = []
  for (let index = 0, len = payloads.length; index < len; index++) {
    const payload = payloads[index]
    const title = payload.title
    const category = payload.category
    const answers = payload.answers
    const correctAnswer = payload.correctAnswer
    const question = await quiz.createQuestion({
      title: title,
      category: category,
      answers: answers,
      correctAnswer: correctAnswer,
    })
    results.push(question.id)
  }

  res.json(results)
}

async function getQuestion(req, res) {
  const question = await Question.findByPk(req.params.id)
  if (!question) {
    throw new AxivError({ message: 'Cannot find this question', code: 404 })
  }

  res.json(question)
}

async function getQuiz(req, res) {
  const quiz = await Quiz.findByPk(req.params.id, {
    include: { model: Question, as: 'questions' },
    order: [[Question, 'id']],
  })
  if (!quiz) {
    throw new AxivError({ message: 'Cannot find this quiz.', code: 404 })
  }

  res.json(quiz)
}

function listQuestions(req, res) {
  return Question.findAll({ order: ['category', 'title'] }).then((questions) =>
    res.json(questions)
  )
}

async function listQuizzes(req, res) {
  return Quiz.findAll({ order: ['title'] }).then((quizzes) => res.json(quizzes))
}

async function listQuizzesForCategoryMode(req, res) {
  const { mode } = req.params
  const quizzes = await (mode === 'multicat'
    ? Quiz.getMultiCategoryQuizzes()
    : Quiz.getSingleCategoryQuizzes())
  res.json(quizzes)
}

async function removeQuestion(req, res) {
  const question = await Question.findByPk(req.params.id)
  if (!question) {
    throw new AxivError({ message: 'Cannot find this question', code: 404 })
  }

  await question.destroy()
  res.json({ status: 'successful removal' })
}
