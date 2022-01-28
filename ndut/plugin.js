const buildPermission = require('../lib/build-permission')
const buildAccess = require('../lib/build-access')
const buildAccessLevel = require('../lib/build-access-level')

const plugin = async function (scope, options) {
  const { getNdutConfig } = scope.ndut.helper
  for (const m of ['route', 'rest', 'static']) {
    const cfg = getNdutConfig(m)
    if (!cfg) continue
    await buildPermission.call(scope, m)
  }
  await buildAccess.call(scope)
  await buildAccessLevel.call(scope)
}

module.exports = async function () {
  const { fp } = this.ndut.helper
  return fp(plugin)
}
