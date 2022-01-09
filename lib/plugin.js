const { Ability } = require('@casl/ability')

module.exports = async function (scope, options) {
  const { _, aneka, getNdutConfig } = scope.ndut.helper
  const { requireBase } = aneka
  const { makeRuleName } = scope.ndutRole.helper
  const { config } = scope
  let allRules = []

  const normalize = (rule, alias) => {
    const nc = getNdutConfig(rule.type, true)
    if (_.isEmpty(nc)) return
    if (_.isArray(rule.subject)) {
      _.each(rule.subject, s => {
        s = `/${nc.prefix}${alias}${s}`
      })
    } else {
      rule.subject = `/${nc.prefix}${alias}${rule.subject}`
    }
    rule.name = makeRuleName(rule)
    return rule
  }

  for (const n of config.nduts) {
    try {
      let rules = await requireBase(n.dir + '/ndutRole/permissions', scope) || []
      rules = _.without(_.map(rules, r => {
        return normalize(r, '/' + n.alias)
      }), null, undefined)
      allRules = _.concat(allRules, rules)
    } catch (err) {}
  }
  try {
    let rules = await requireBase(config.dir.base + '/ndutRole/permissions', scope) || []
    rules = _.without(_.map(rules, r => {
      return normalize(r, '')
    }), null, undefined)
    allRules = _.concat(allRules, rules)
  } catch (err) {}
  scope.ndutRole.rules = allRules
  const accessToken = _(allRules)
    .map(r => {
      const item = _.get(r, 'conditions.access')
      if (!item) return
      const items = []
      const x = JSON.parse(JSON.stringify(item), function (k, v) {
        if (_.isString(v) || _.isArray(v)) items.push(v)
        return v
      })
      return items
    })
    .flattenDeep()
    .uniq()
    .without(null, undefined, '')
    .value()
  const lookups = _.map(accessToken, item => {
    return { model: 'RoleTeam', column: 'access', value: item, name: item }
  })
  await scope.ndutDb.model.DbLookup.create(lookups)
}
