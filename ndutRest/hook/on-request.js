const { Ability, subject } = require('@casl/ability')

const mapper = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'remove'
}

module.exports = async function (request, reply) {
  const { _ } = this.ndut.helper
  if (!request.user) return
  if (!request.protectedRoute) return
  const { permissions, rules, team } = await this.ndutRole.helper.getAccessByUser(request.user.id)
  if (rules.length === 0) throw this.Boom.forbidden('No permission found')
  const ability = new Ability(rules)
  const checker = {
    model: request.params.model,
    access: permissions
  }
  const methods = _.isString(request.routerMethod) ? [request.routerMethod] : request.routerMethod
  let ok = false
  _.each(methods, m => {
    const action = mapper[m.toUpperCase()]
    if (ability.can(action, subject(request.routerPath, checker))) {
      ok = true
      return false
    }
  })
  if (!ok) throw this.Boom.forbidden('Access denied')
  team.rules = rules
  team.permissions = permissions
  request.team = team
}
