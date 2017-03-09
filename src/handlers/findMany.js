import Boom from 'boom';
import pick from 'lodash/pick';

export default ({
  getRepository = (request) => request.pre.repository,
  extractQueryParams = (request) => (
    pick(request.pre.queryParams, ['query', 'skip', 'limit', 'orderBy', 'fields'])
  ),
}) => async (request, reply) => {
  const queryParams = extractQueryParams(request);
  const Repository = getRepository(request);

  try {
    reply(
      await Repository.findMany(queryParams).then((c) => c.toArray()),
    );
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
