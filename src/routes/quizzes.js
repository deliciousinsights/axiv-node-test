import Quiz from '../models/Quiz.js'

export default function initRoutes(app) {
  app.get('/quizzes', listQuizzes)
  app.get('/quizzes/:mode(singlecat|multicat)', listQuizzesForCategoryMode)
  app.get('/quizzes/:id', getQuiz)
}

// Route handlers
// --------------

async function getQuiz(req, res) {
  const quiz = await Quiz.getQuizWithQuestions(req.params.id)

  res.json(quiz)
}

async function listQuizzes(req, res) {
  const quizzes = await Quiz.findAll({ order: ['title'] })
  res.json(quizzes)
}

async function listQuizzesForCategoryMode(req, res) {
  const { mode } = req.params
  const quizzes = await (mode === 'multicat'
    ? Quiz.getMultiCategoryQuizzes()
    : Quiz.getSingleCategoryQuizzes())
  res.json(quizzes)
}
