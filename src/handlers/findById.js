import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

export default ({
  getRepository = (request) => request.pre.repository,
  extractId = (request) => objectId(request.params.id),
  extractQuery = (request) => request.pre.query,
}) => async (request, reply) => {
  const query = extractQuery(request);
  const id = extractId(request);
  const Repository = getRepository(request);

  try {
    const entity = await Repository.findOne({ query });

    if (!entity) {
      return reply(Boom.notFound(`Unable to find entity with id ${id}`));
    }

    return reply(entity);
  } catch (err) {
    return reply(Boom.wrap(err));
  }
};
