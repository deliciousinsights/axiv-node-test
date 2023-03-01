import { createApp } from '@axiv/backend-core'

import { registerCoreAssociations, registerCoreModels } from './models/index.js'
import routes from './routes/index.js'

const app = await createApp({
  coreAssociations: registerCoreAssociations,
  coreModels: registerCoreModels,
  routes: routes,
})

export default app
