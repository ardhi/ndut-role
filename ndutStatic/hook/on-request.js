const checkPermissionWildcard = require('../../lib/check-permission-wildcard')
const checkAccess = require('../../lib/check-access')

module.exports = async function (request, reply) {
  const { _ } = this.ndut.helper
  if (!request.user) return
  if (!request.protected) return
  const team = await this.ndutRole.helper.getAccessByUser(request.user.id)
  const ruleName = checkPermissionWildcard.call(this, 'static', request, true)
  const rule = checkAccess.call(this, 'static', ruleName, team)
  request.team = team
  request.rule = rule
}
