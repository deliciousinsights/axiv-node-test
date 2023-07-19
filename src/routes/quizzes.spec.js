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

      expect(body).toMatchObject({ id: 1, title: 'Pop Culture' })
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

      expect(body).toMatchObject([{ title: 'Science is Awesome' }])
    })

    it('should correctly filter for multiple-category quizzes, sorted by ID', async () => {
      const { body } = await client
        .get('/quizzes/multicat')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(200)

      expect(body).toMatchObject([
        { title: 'Computer Science' },
        { title: 'Pop Culture' },
      ])
    })

    it('should 404 on an unknown quiz', () => {
      return client
        .get('/quizzes/42')
        .set('Authorization', token)
        .set('X-Instance-Code', ORG_CODE)
        .expect(404)
    })
  })
})
