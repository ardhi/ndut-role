module.exports = function (type, ruleName, team) {
  const { _ } = this.ndut.helper
  const { accessLevel } = this.ndutRole
  const rule = _.find(this.ndutRole.rule[type], { name: ruleName })
  // access level
  if (rule && !rule.ndutAuthPrivate && accessLevel.hasChildren()) {
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
  return rule
}
