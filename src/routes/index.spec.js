import {
  client,
  login,
  ORG_CODE,
  seedCorpus,
  seedQuestion,
} from '../../jest/utils.js'
import Question from '../models/Question.js'

describe('All Routes', () => {
  let token = null

  beforeAll(async () => {
    const { body } = await login()
    token = body.token

    await seedCorpus({
      'Pop Culture': [
        { category: 'Comics', title: 'Was Gunnm created by Yokito Kishiro?' },
        {
          category: 'TV Series',
          title: 'Does Benedict Cumberbatch star in Sherlock?',
        },
        { category: 'Comics', title: 'Is Gally’s original name Yoko?' },
      ],
      'Computer Science': [
        {
          category: 'Programming',
          title: 'Does JS distinguish between null and undefined?',
        },
        {
          category: 'Programming',
          title: 'Can destructuring be used anywhere there’s an assignment?',
        },
        { category: 'Devops', title: 'Is Kubernetes related to Docker?' },
      ],
      'Science is Awesome': [
        {
          category: 'Physics',
          title: 'Does the universe expand?',
        },
        {
          category: 'Physics',
          title:
            'Does observation of quantic phenomena collapse their wavefunction?',
        },
      ],
    })
  })

  describe('Health Check', () => {
    it('should always respond successfully', async () => {
      return client
        .get('/healthcheck')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)
        .expect({ status: '👌🏻', message: "We're all fine here!" })
    })
  })

  describe('Quizzes', () => {
    it('should provide a quiz listing, sorted by title', async () => {
      const { body } = await client
        .get('/quizzes')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toMatchObject([
        { title: 'Computer Science' },
        { title: 'Pop Culture' },
        { title: 'Science is Awesome' },
      ])
    })

    it('should provide an existing quiz with its questions, sorted by ID', async () => {
      const { body } = await client
        .get('/quizzes/1')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toEqual({ id: 1, title: 'Pop Culture' })
      expect(body.questions).toMatchObject([
        { id: 1, title: 'Was Gunnm created by Yokito Kishiro?' },
        { id: 2, title: 'Does Benedict Cumberbatch star in Sherlock?' },
        { id: 3, title: 'Is Gally’s original name Yoko?' },
      ])
    })

    it('should correctly filter for single-category quizzes, sorted by ID', async () => {
      const { body } = await client
        .get('/quizzes/singlecat')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toMatchObject([
        { title: 'Computer Science' },
        { title: 'Pop Culture' },
      ])
    })

    it('should correctly filter for multiple-category quizzes, sorted by ID', async () => {
      const { body } = await client
        .get('/quizzes/multicat')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toMatchObject([{ title: 'Science is Awesome' }])
    })

    it('should 404 on an unknown quiz', () => {
      return client
        .get('/quizzes/42')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(404)
    })
  })

  describe('Questions', () => {
    it('should provide a listing of all questions, sorted by category then title', async () => {
      const { body } = await client
        .get('/questions')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toMatchObject([
        { category: 'Comics', title: 'Is Gally’s original name Yoko?' },
        { category: 'Comics', title: 'Was Gunnm created by Yokito Kishiro?' },
        { category: 'Devops', title: 'Is Kubernetes related to Docker?' },
        {
          category: 'Physics',
          title:
            'Does observation of quantic phenomena collapse their wavefunction?',
        },
        { category: 'Physics', title: 'Does the universe expand?' },
        {
          category: 'Programming',
          title: 'Can destructuring be used anywhere there’s an assignment?',
        },
        {
          category: 'Programming',
          title: 'Does JS distinguish between null and undefined?',
        },
        {
          category: 'TV Series',
          title: 'Does Benedict Cumberbatch star in Sherlock?',
        },
      ])
    })

    it('should provide an existing question', () => {
      return client
        .get('/questions/1')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)
        .expect({
          id: 1,
          answers: ['yes', 'no'],
          category: 'Comics',
          correctAnswer: 'yes',
          quizId: 1,
          title: 'Was Gunnm created by Yokito Kishiro?',
        })
    })

    it('should 404 on an unknown question', () => {
      return client
        .get('/questions/42')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(404)
    })

    it('should let us add a single question to a quiz and return its ID', async () => {
      const quizId = 2
      const payload = {
        category: 'Science',
        title: 'What is the formula of Methane?',
        answers: ['CH4', 'C2H6', 'C4H10'],
        correctAnswer: 'CH4',
      }

      const { body } = await client
        .post(`/quizzes/${quizId}/questions`)
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .send(payload)
        .expect(201)

      const id = body[0]
      expect((await Question.findByPk(id)).toJSON()).toEqual({
        ...payload,
        id,
        quizId,
      })
    })

    it.todo(
      'should let us add multiple questions to a quiz and return their IDs'
    )

    it('should let us delete a question', async () => {
      const question = await seedQuestion({
        quizId: 2,
        category: 'Ethics',
        title: 'Are nazis bad?',
      })

      await client
        .delete(`/questions/${question.id}`)
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(await Question.findByPk(question.id)).toBeNull()
    })

    it.todo('should 404 when attempting to remove an unknown question')
  })
})
