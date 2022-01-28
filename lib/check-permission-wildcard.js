const mapper = require('./mapper.json')

module.exports = function (type, request) {
  const { _ } = this.ndut.helper
  const rules = []
  const iMapper = _.invert(mapper)
  _.each(this.ndutRole.rule[type], r => {
    const item = _.cloneDeep(r)
    if (_.isString(item.path)) item.path = [item.path]
    if (_.isString(item.method)) item.method = [item.method]
    _.each(item.path, p => {
      _.each(item.method, m => {
        rules.push({
          name: item.name,
          access: item.access,
          path: p,
          method: iMapper[m]
        })
      })
    })
  })
  const route = this.ndutAuth.helper.routeMatch(request, rules, true)
  if (!route) throw this.Boom.forbidden('Access denied')
  return route.name
}
