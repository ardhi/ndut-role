module.exports = function (rule) {
  const { _ } = this.ndut.helper
  const method = _.isArray(rule.method) ? rule.method.join(' ') : rule.method
  return _.camelCase(`${method} ${rule.inverted ? 'inverted' : ''} ${rule.path}`)
}
