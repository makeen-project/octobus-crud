import handler from '../handlers/createOne';
import identity from 'lodash/identity';

export default ({
  repositoryName,
  basePath,
  schema,
  config = {},
  parsePayload = identity,
}) => ({
  path: basePath,
  method: 'POST',
  handler: handler(),
  config: {
    id: `${repositoryName}:createOne`,
    validate: {
      payload: schema,
    },
    description: `Create a new entity of type ${repositoryName}`,
    tags: ['api'],
    pre: [{
      method() {
        return this.repositoryManager.get(repositoryName);
      },
      assign: 'repository',
    }, {
      method: (request, reply) => reply(parsePayload(request.payload)),
      assign: 'payload',
    }],
    ...config,
  },
});
