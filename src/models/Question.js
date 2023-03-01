import { config, databases } from '@axiv/backend-core'
import { DataTypes } from 'sequelize'

const QuestionSchema = {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The title of the question',
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'The reference to the parent quiz',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The category of the question',
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'The list of possible answers',
    // This should be automatically deserialized when eager-loaded too, but
    // despite our MariaDB-dialect-over-MariaDB-DB mapping, it doesn't. So we
    // need this explicit accessor to ensure full deserialization. :(
    get() {
      const baseValue = this.getDataValue('answers')
      return typeof baseValue === 'string' ? JSON.parse(baseValue) : baseValue
    },
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The correct answer',
  },
}

const Question = databases.core.define('questions', QuestionSchema, {
  ...config.database.model,
  timestamps: false,
})

export default Question
