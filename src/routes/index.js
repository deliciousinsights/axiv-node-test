import initQuestionRoutes from './questions.js'
import initQuizRoutes from './quizzes.js'

export default function initRoutes(app) {
  app.get('/healthcheck', healthCheck)

  initQuizRoutes(app)
  initQuestionRoutes(app)
}

// Route handlers
// --------------

function healthCheck(req, res) {
  res.send({ status: '👌🏻', message: "We're all fine here!" })
}
