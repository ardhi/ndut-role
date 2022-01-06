module.exports = async function (teamId) {
  const { _ } = this.ndut.helper
  const team = await this.ndutDb.model.RoleTeam.findOne({ where: { id: teamId, status: 'ENABLED' } })
  if (!team) throw this.Boom.forbidden('No such team found or team is currently disabled')
  return team
}
