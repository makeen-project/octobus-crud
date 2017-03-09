import Boom from 'boom';
import { ObjectID as objectId } from 'mongodb';

export default ({
  getRepository = (request) => request.pre.repository,
  extractId = (request) => objectId(request.params.id),
  extractQuery = (request) => request.pre.query,
  extractPayload = (request) => request.pre.payload,
}) => async (request, reply) => {
  const id = extractId(request);
  const payload = extractPayload(request);
  const query = extractQuery(request);
  const Repository = getRepository(request);

  try {
    const entity = await Repository.findOne({ query });

    if (!entity) {
      return reply(Boom.notFound(`Unable to find entity with id ${id}`));
    }

    await Repository.validate({
      ...entity,
      ...payload,
    });

    const result = await Repository.updateOne({
      query: {
        _id: objectId(id),
      },
      update: {
        $set: payload,
      },
    });

    return reply(result);
  } catch (err) {
    if (err.isJoi) {
      return reply(Boom.badRequest(err.details[0].message));
    }

    return reply(Boom.wrap(err));
  }
};
