const { Ability } = require('@casl/ability')

module.exports = async function (scope, options) {
  const { _, aneka, getNdutConfig } = scope.ndut.helper
  const { requireBase, pascalCase } = aneka
  const { config } = scope
  let allRules = []

  for (const n of config.nduts) {
    try {
      let rules = await requireBase(n.dir + '/ndutRole/permissions', scope) || []
      rules = _.without(_.map(rules, r => {
        const nc = getNdutConfig(r.type, true) // find by alias
        if (_.isEmpty(nc)) return
        if (!r.name) r.name = pascalCase(`${n.alias} ${r.type} ${r.subject}`)
        r.subject = `/${nc.prefix}/${n.alias}${r.subject}`
        return r
      }), null, undefined)
      allRules = _.concat(allRules, rules)
    } catch (err) {}
  }
  try {
    const rules = await requireBase(config.dir.base + '/ndutRole/permissions', scope) || []
    allRules = _.concat(allRules, rules)
  } catch (err) {}
  scope.decorate('ndutRole', { rules: allRules })
}
