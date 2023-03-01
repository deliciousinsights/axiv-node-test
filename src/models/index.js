import Question from './Question.js'
import Quiz from './Quiz.js'

export function registerCoreModels() {
  // Just importing this module initializes the models by virtue of imports
}

export function registerCoreAssociations() {
  Question.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' })
  Quiz.hasMany(Question, {
    foreignKey: 'quizId',
    as: 'questions',
    onDelete: 'CASCADE',
  })
}
