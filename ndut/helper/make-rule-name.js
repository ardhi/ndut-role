module.exports = function (rule) {
  const { _, aneka } = this.ndut.helper
  const { pascalCase } = aneka
  const action = _.isArray(rule.action) ? rule.action.join(' ') : rule.action
  return pascalCase(`${rule.type} ${action} ${rule.inverted ? 'inverted' : ''} ${rule.subject}`)
}
