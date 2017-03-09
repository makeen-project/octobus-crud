import Joi from 'joi';
import pick from 'lodash/pick';
import handler from '../handlers/findMany';

export default ({
  repositoryName,
  basePath,
  config = {},
  parseQuery,
}) => ({
  path: basePath,
  method: 'GET',
  handler: handler(),
  config: {
    id: `${repositoryName}:findMany`,
    validate: {
      query: {
        query: Joi.object().default({}),
        offset: Joi.number(),
        limit: Joi.number(),
        orderBy: Joi.object().default({}),
        fields: Joi.object().default({}),
      },
    },
    description: `Find entities of type ${repositoryName}`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => {
        const { query } = request;
        const params = pick(query, ['fields', 'orderBy']);
        params.query = parseQuery(query.query);

        if (query.offset !== undefined) {
          params.skip = parseInt(query.offset, 10);
        }

        if (query.limit !== undefined) {
          params.limit = parseInt(query.limit, 10);
        }

        reply(params);
      },
      assign: 'queryParams',
    }],
    ...config,
  },
});
