import { AxivError } from '@axiv/backend-core/helpers'

export async function ensureEntity(Model, id, name, options = {}) {
  const result = await Model.findByPk(id, options)
  if (!result) {
    throw new AxivError({ message: `Cannot find this ${name}.`, code: 404 })
  }
  return result
}
