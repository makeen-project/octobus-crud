import Boom from 'boom';

export default ({
  getRepository = (request) => request.pre.repository,
  extractQuery = (request) => request.pre.query,
}) => async (request, reply) => {
  const query = extractQuery(request);
  const Repository = getRepository(request);

  try {
    reply(await Repository.count({ query }));
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
