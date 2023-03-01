import { config, databases } from '@axiv/backend-core'
import { DataTypes, Model } from 'sequelize'

class Quiz extends Model {
  static getMultiCategoryQuizzes() {
    // TODO: replace with actual implementation
    return this.findAll()
  }

  static getSingleCategoryQuizzes() {
    // TODO: replace with actual implementation
    return []
  }
}

const QuizSchema = {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The title of the quiz',
  },
}

Quiz.init(QuizSchema, {
  ...config.database.model,
  modelName: 'quizzes',
  sequelize: databases.core,
  timestamps: false,
})

export default Quiz
