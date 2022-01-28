module.exports = async function (type) {
  const { _, aneka, getNdutConfig, getConfig } = this.ndut.helper
  const { requireBase } = aneka
  const { makeRuleName } = this.ndutRole.helper
  const config = getConfig()
  this.ndutRole.rule = this.ndutRole.rule || {}
  let allRules = []

  const normalize = async (rule, prefix) => {
    const nc = getNdutConfig(type)
    if (_.isEmpty(nc)) return
    if (_.isArray(rule.path)) {
      _.each(rule.path, (s, i) => {
        rule.path[i] = `/${nc.prefix}${prefix}${s}`.replace(/\/\//g, '/')
      })
    } else {
      rule.path = `/${nc.prefix}${prefix}${rule.path}`.replace(/\/\//g, '/')
    }
    rule.name = makeRuleName(rule, type)
    return rule
  }

  for (const n of config.nduts) {
    const cfg = getNdutConfig(n)
    try {
      let rules = await requireBase(`${cfg.dir}/ndutRole/permission/${type}`, this) || []
      for (const i in rules) {
        let r = rules[i]
        rules[i] = await normalize(r, cfg.prefix === '' ? '' : ('/' + cfg.prefix))
      }
      rules = _.without(rules, null, undefined)
      allRules = _.concat(allRules, rules)
    } catch (err) {}
  }
  this.ndutRole.rule[type] = allRules
}
