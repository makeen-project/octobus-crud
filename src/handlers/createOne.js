import Boom from 'boom';

export default ({
  getRepository = (request) => request.pre.repository,
  extractPayload = (request) => request.pre.payload,
}) => async (request, reply) => {
  const payload = extractPayload(request);
  const Repository = getRepository(request);

  try {
    reply(await Repository.createOne(payload));
  } catch (err) {
    reply(Boom.wrap(err));
  }
};
