import Joi from 'joi';
import handler from '../handlers/deleteOne';
import identity from 'lodash/identity';

export default ({
  repositoryName,
  basePath,
  parseQuery = identity,
  config = {},
}) => ({
  path: `${basePath}/deleteOne`,
  method: 'DELETE',
  handler: handler(),
  config: {
    id: `${repositoryName}:deleteOne`,
    validate: {
      payload: {
        query: Joi.object().required(),
      },
    },
    description: `Delete an entity of type ${repositoryName}`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => (
        reply(parseQuery(request.query.query))
      ),
      assign: 'query',
    }],
    ...config,
  },
});
