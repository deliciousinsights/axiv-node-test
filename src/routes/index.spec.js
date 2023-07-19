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
})
