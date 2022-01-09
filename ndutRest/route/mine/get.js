module.exports = {
  schema: {
    description: 'Show your own role',
    tags: ['Role']
  },
  handler: async function (request, reply) {
    return {
      data: request.role
    }
  }
}
