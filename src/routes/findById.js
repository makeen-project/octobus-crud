import Joi from 'joi';
import identity from 'lodash/identity';
import handler from '../handlers/findById';

export default ({
  repositoryName,
  basePath,
  config = {},
  idValidator = Joi.any().required(),
  idToQuery = identity,
}) => ({
  path: `${basePath}/{id}`,
  method: 'GET',
  handler: handler(),
  config: {
    id: `${repositoryName}:findById`,
    validate: {
      params: {
        id: idValidator,
      },
    },
    description: `Find an entity of type ${repositoryName} by id`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => reply(idToQuery(request.params.id)),
      assign: 'query',
    }],
    ...config,
  },
});
