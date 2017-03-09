import Joi from 'joi';
import handler from '../handlers/updateOne';

export default ({
  repositoryName,
  basePath,
  config = {},
  idValidator,
  idToQuery,
  parsePayload,
}) => ({
  path: `${basePath}/{id}`,
  method: 'PATCH',
  handler: handler(),
  config: {
    id: `${repositoryName}:updateOne`,
    validate: {
      params: {
        id: idValidator,
      },
      payload: Joi.object().required(),
    },
    description: `Update an entity of type ${repositoryName}`,
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
