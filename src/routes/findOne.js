import Joi from 'joi';
import identity from 'lodash/identity';
import handler from '../handlers/findOne';

export default ({
  repositoryName,
  basePath,
  config = {},
  parseQuery = identity,
}) => ({
  path: `${basePath}/findOne`,
  method: 'GET',
  handler: handler(),
  config: {
    id: `${repositoryName}:findOne`,
    validate: {
      query: {
        query: Joi.object().default({}),
      },
    },
    description: `Find one entity of type ${repositoryName}`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => reply(parseQuery(request.query.query)),
      assign: 'query',
    }],
    ...config,
  },
});
