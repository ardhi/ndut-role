const buildPermission = require('../lib/build-permission')
const buildAccess = require('../lib/build-access')
const buildAccessLevel = require('../lib/build-access-level')

const plugin = async function (scope, options) {
  await buildPermission.call(scope)
  await buildAccess.call(scope)
  await buildAccessLevel.call(scope)
}

module.exports = async function () {
  const { fp } = this.ndut.helper
  return fp(plugin)
}
