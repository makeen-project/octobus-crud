import handler from '../handlers/replaceOne';

export default ({
  repositoryName,
  basePath,
  schema,
  config = {},
  idToQuery,
  parsePayload,
  idValidator,
}) => ({
  path: `${basePath}/{id}`,
  method: 'PUT',
  handler: handler(),
  config: {
    id: `${repositoryName}:replaceOne`,
    validate: {
      params: {
        id: idValidator,
      },
      payload: schema,
    },
    description: `Replace an entity of type ${repositoryName}`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => reply(idToQuery(request.params.id)),
      assign: 'query',
    },
    {
      method: (request, reply) => reply(parsePayload(request.payload)),
      assign: 'payload',
    }],
    ...config,
  },
});
