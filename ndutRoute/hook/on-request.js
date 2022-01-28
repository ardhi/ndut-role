const checkPermission = require('../../lib/check-permission')
const checkAccess = require('../../lib/check-access')

module.exports = async function (request, reply) {
  const { _ } = this.ndut.helper
  if (!request.user) return
  if (!request.protected) return
  const team = await this.ndutRole.helper.getAccessByUser(request.user.id)
  const ruleName = checkPermission.call(this, 'route', request)
  const rule = checkAccess.call(this, 'route', ruleName, team)
  request.team = team
  request.rule = rule
}
