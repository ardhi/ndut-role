module.exports = async function () {
  const { _, aneka, getNdutConfig, getConfig } = this.ndut.helper
  const { requireBase } = aneka
  const { makeRuleName } = this.ndutRole.helper
  const config = await getConfig()
  let allRules = []

  const normalize = async (rule, prefix) => {
    const nc = await getNdutConfig(rule.type, true)
    if (_.isEmpty(nc)) return
    if (_.isArray(rule.subject)) {
      _.each(rule.subject, (s, i) => {
        rule.subject[i] = `/${nc.prefix}${prefix}${s}`.replace(/\/\//g, '/')
      })
    } else {
      rule.subject = `/${nc.prefix}${prefix}${rule.subject}`.replace(/\/\//g, '/')
    }
    rule.name = makeRuleName(rule)
    return rule
  }

  for (let n of config.nduts) {
    n = await getNdutConfig(n)
    try {
      let rules = await requireBase(n.dir + '/ndutRole/permissions', this) || []
      for (const i in rules) {
        let r = rules[i]
        rules[i] = await normalize(r, n.prefix === '' ? '' : ('/' + n.prefix))
      }
      rules = _.without(rules, null, undefined)
      allRules = _.concat(allRules, rules)
    } catch (err) {}
  }
  this.ndutRole.rules = allRules
}
