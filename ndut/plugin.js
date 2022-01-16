const { Ability } = require('@casl/ability')

const plugin = async function (scope, options) {
  const { _, aneka, getNdutConfig, getConfig } = scope.ndut.helper
  const { requireBase } = aneka
  const { makeRuleName } = scope.ndutRole.helper
  const config = await getConfig()
  let allRules = []

  const normalize = async (rule, prefix) => {
    const nc = await getNdutConfig(rule.type, true)
    if (_.isEmpty(nc)) return
    if (_.isArray(rule.subject)) {
      _.each(rule.subject, (s, i) => {
        rule.subject[i] = `/${nc.prefix}${prefix}${s}`
      })
    } else {
      rule.subject = `/${nc.prefix}${prefix}${rule.subject}`
    }
    rule.name = makeRuleName(rule)
    return rule
  }

  for (let n of config.nduts) {
    n = await getNdutConfig(n)
    try {
      let rules = await requireBase(n.dir + '/ndutRole/permissions', scope) || []
      for (const i in rules) {
        let r = rules[i]
        rules[i] = await normalize(r, n.prefix === '' ? '' : ('/' + n.prefix))
      }
      rules = _.without(rules, null, undefined)
      allRules = _.concat(allRules, rules)
    } catch (err) {}
  }
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
    .without(null, undefined, '', 'siteadmin', 'admin')
    .value()
  const lookups = _.map(accessToken, item => {
    return { model: 'RoleTeam', column: 'access', value: item, name: item }
  })
  await scope.ndutDb.model.DbLookup.create(lookups)
}

module.exports = async function () {
  const { fp } = this.ndut.helper
  return fp(plugin)
}
