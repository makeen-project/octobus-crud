import Joi from 'joi';
import handler from '../handlers/count';
import identity from 'lodash/identity';

export default ({
  repositoryName,
  basePath,
  parseQuery = identity,
  config = {},
}) => ({
  path: `${basePath}/count`,
  method: 'GET',
  handler: handler(),
  config: {
    id: `${repositoryName}:count`,
    validate: {
      query: {
        query: Joi.object().default({}),
      },
    },
    description: `Count entities of type ${repositoryName}`,
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
