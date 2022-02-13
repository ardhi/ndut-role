const checkPermission = require('../../lib/check-permission')
const checkAccess = require('../../lib/check-access')

module.exports = {
  level: 50,
  handler: async function (request, reply) {
    if (!request.user) return
    if (!request.protected) return
    const team = await this.ndutRole.helper.getAccessByUser(request.user.id)
    const ruleName = checkPermission.call(this, 'rest', request)
    const rule = checkAccess.call(this, 'rest', ruleName, team)
    request.team = team
    request.rule = rule
  }
}
