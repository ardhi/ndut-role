module.exports = async function () {
  const { _ } = this.ndut.helper
  const allRules = this.ndutRole.rules
  const accessToken = _(allRules)
    .map(r => {
      let item = r.access || []
      if (_.isString(item)) item = [item]
      return _.map(item, i => {
        return i[0] === '!' ? i.slice(1) : i
      })
    })
    .flattenDeep()
    .uniq()
    .without(null, undefined, '', 'siteadmin')
    .value()
  const lookups = _.map(accessToken, item => {
    return { model: 'RoleTeam', column: 'access', value: item, name: item }
  })
  await this.ndutDb.model.DbLookup.create(lookups)
}
