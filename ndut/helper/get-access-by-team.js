module.exports = async function (teamId) {
  const { _ } = this.ndut.helper
  const team = await this.ndutDb.model.RoleTeam.findOne({ where: { id: teamId, status: 'ENABLED' } })
  if (!team) throw this.Boom.forbidden('No such team found or team is currently disabled')
  const items = await this.ndutDb.model.RoleRule.find({ where: { teamId: teamId } })
  let permissions = _.map(items, 'permission')
  let rules = []
  if (permissions.includes('*')) {
    rules = this.ndutRole.rules
    permissions = ['admin']
  } else {
    rules = _.filter(this.ndutRole.rules, r => {
      return permissions.includes(r.name)
    })
  }
  return { permissions, rules, team }
}
