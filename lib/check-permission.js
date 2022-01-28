const { Ability, subject } = require('@casl/ability')
const mapper = require('./mapper.json')
const translator = require('./translator.json')

const translateFilter = query => {
  return JSON.parse(JSON.stringify(query), function (key, value) {
    const newKey = translator[key]
    if (newKey) {
      this[newKey] = value
      return
    }
    return value
  })
}

module.exports = function (type, request) {
  const { _ } = this.ndut.helper
  const { makeRuleName } = this.ndutRole.helper
  const rules = _.map(this.ndutRole.rule[type] || [], r => {
    const rule = {
      subject: r.path,
      action: r.method,
      inverted: r.inverted
    }
    if (r.metaFilter) rule.conditions = translateFilter(r.metaFilter)
    return rule
  })
  const ability = new Ability(rules)
  const methods = _.isString(request.routerMethod) ? [request.routerMethod] : request.routerMethod
  const sub = subject(request.routerPath, request.params)
  let ok = false
  let ruleName
  _.each(methods, m => {
    const action = mapper[m.toUpperCase()]
    if (ability.can(action, sub)) {
      const rule = ability.relevantRuleFor(action, sub)
      if (rule) ruleName = makeRuleName({
        method: rule.action,
        path: rule.subject,
        inverted: rule.inverted
      })
      ok = true
      return false
    }
  })
  if (!ok || !ruleName) throw this.Boom.forbidden('Access denied')
  return ruleName
}
