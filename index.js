module.exports = async function () {
  const { fp } = this.ndut.helper
  const name = 'ndut-role'
  const plugin = fp(require('./lib/plugin'))
  const dependency = ['ndut-db', 'ndut-auth']
  return { name, plugin, dependency }
}
