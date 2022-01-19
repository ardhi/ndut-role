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
  const methods = _.isString(request.routerMethod) ? [request.routerMethod] : request.routerMethod
  const sub = subject(request.routerPath, request.params)
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
  if (!ok || !ruleName) throw this.Boom.forbidden('Access denied')
  const { accessLevel } = this.ndutRole
  const rule = _.find(this.ndutRole.rules, { name: ruleName })
  // access level
  if (rule && !rule.private && accessLevel.hasChildren()) {
    const accesses = _.isString(rule.access) ? [ rule.access ] : rule.access
    let all = []
    const omitted = [null, undefined, '']
    _.each(accesses, a => {
      if (a[0] === '!') {
        omitted.push(a.slice(1))
        return
      }
      const node = accessLevel.first(n => {
        return n.model.id === a
      })
      if (node) {
        const items = _.map(node.getPath(), n => n.model.id)
        all = _.concat(all, items)
      }
    })
    all = _.uniq(_.without(all, ...omitted))
    if (all.length === 0) throw this.Boom.forbidden('Access denied')
    const x = _.intersection(team.access, all)
    if (x.length === 0) throw this.Boom.forbidden('Access denied')
  }
  // TODO: what next to the ruleName ???
  // idea: filter by own records, by teamId, etc
  request.role = team
  request.rule = rule
}
