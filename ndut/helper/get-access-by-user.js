module.exports = async function (userId) {
  const teamUser = await this.ndutDb.model.RoleTeamUser.findOne({ where: { userId } })
  if (!teamUser) throw this.Boom.forbidden('User doesn\'t belongs to any team yet')
  return await this.ndutRole.helper.getAccessByTeam(teamUser.teamId)
}
