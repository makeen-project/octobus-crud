import Boom from 'boom';

export default ({
  getRepository = (request) => request.pre.repository,
  extractQuery = (request) => request.pre.query,
}) => async (request, reply) => {
  const query = extractQuery(request);
  const Repository = getRepository(request);

  try {
    const entity = await Repository.findOne({ query });

    if (!entity) {
      return reply(Boom.notFound('Unable to find entity.'));
    }

    return reply(entity);
  } catch (err) {
    return Boom.wrap(err);
  }
};
