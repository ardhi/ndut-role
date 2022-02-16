module.exports = async function () {
  const { _, aneka, getNdutConfig } = this.ndut.helper
  const { requireBase } = aneka
  const { TreeModel } = this.ndutRole.helper
  const appCfg = getNdutConfig('app')
  const tree = new TreeModel()

  try {
    let data = await requireBase(`${appCfg.dir}/ndutRole/access-level.json`)
    if (_.isArray(data)) data = { id: 'admin', children: data }
    if (data.id !== 'admin') throw new Error('Root access level must be the \'admin\'')
    this.ndutRole.accessLevel = tree.parse(data)
  } catch(err) {
    this.ndutRole.accessLevel = tree.parse({})
    this.log.error('Can\'t find access level file')
    // this.ndut.helper.dumpError(err)
  }
}
