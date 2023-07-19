import { config, databases } from '@axiv/backend-core'
import { DataTypes, Model, Sequelize } from 'sequelize'

import { ensureEntity } from '../helpers.js'
import Question from './Question.js'

class Quiz extends Model {
  static #getCategoryModeQuizzes(mode) {
    return this.findAll({
      attributes: {
        // The object form of `attributes` uses allowlist (include) and denylist (exclude)
        // for SELECT clause construction.  We grab all Quiz fields + this counter:
        include: [
          [
            Sequelize.fn(
              'COUNT',
              Sequelize.fn('DISTINCT', Sequelize.col('questions.category'))
            ),
            'cats',
          ],
        ],
      },
      include: [
        // We need to define the join here.  Because `attributes` is empty, we actually
        // don't eager-load anything, we just need this for the counter.
        { model: Question, as: 'questions', required: true, attributes: [] },
      ],
      // We need to qualify the field because questions have `id` too.  As MySQL / MariaDB
      // are lenient on GROUP BY clauses, we don't need to provide a full list of
      // non-aggregated columns.
      group: ['quizzes.id'],
      // This is the only difference between single-cat and multi-cat.  No need for value
      // escaping here, but going the extra mile with Sequelize.col remains possible.
      having: Sequelize.literal(mode === 'singlecat' ? 'cats = 1' : 'cats > 1'),
      order: [['id', 'desc']],
    })
  }

  static getMultiCategoryQuizzes() {
    return this.#getCategoryModeQuizzes('multicat')
  }

  static getSingleCategoryQuizzes() {
    return this.#getCategoryModeQuizzes('singlecat')
  }

  static async getQuizWithQuestions(id) {
    return ensureEntity(this, id, 'quiz', {
      include: { model: Question, as: 'questions' },
      order: [[Question, 'id']],
    })
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
