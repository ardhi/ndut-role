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
  const { makeRuleName } = this.ndutRole.helper
  if (!request.user) return
  if (!request.protectedRoute) return
  const team = await this.ndutRole.helper.getAccessByUser(request.user.id)
  const ability = new Ability(this.ndutRole.rules)
  const checker = { access: team.access }
  if (request.params.model) checker.model = request.params.model

  const methods = _.isString(request.routerMethod) ? [request.routerMethod] : request.routerMethod
  const sub = subject(request.routerPath, checker)
  let ok = false
  let ruleName
  _.each(methods, m => {
    const action = mapper[m.toUpperCase()]
    if (ability.can(action, sub)) {
      const rule = ability.relevantRuleFor(action, sub)
      if (rule) {
        rule.type = 'rest'
        ruleName = makeRuleName(rule)
      }
      ok = true
      return false
    }
  })
  if (!ok) throw this.Boom.forbidden('Access denied')
  // TODO: what next to the ruleName ???
  // idea: filter by own records, by teamId, etc
  request.team = team
}
