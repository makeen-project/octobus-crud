import Joi from 'joi';
import handler from '../handlers/deleteOneById';
import identity from 'lodash/identity';

export default ({
  repositoryName,
  basePath,
  config = {},
  idValidator = Joi.any().required(),
  idToQuery = identity,
}) => ({
  path: `${basePath}/{id}`,
  method: 'DELETE',
  handler: handler(),
  config: {
    id: `${repositoryName}:deleteOneById`,
    validate: {
      params: {
        id: idValidator,
      },
    },
    description: `Delete an entity of type ${repositoryName} by id`,
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
