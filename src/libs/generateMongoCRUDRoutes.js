import Joi from 'joi';
import identity from 'lodash/identity';
import trimEnd from 'lodash/trimEnd';
import findByIdRoute from '../routes/findById';
import findManyRoute from '../routes/findMany';
import findOneRoute from '../routes/findOne';
import createOneRoute from '../routes/createOne';
import replaceOneRoute from '../routes/replaceOne';
import updateOneRoute from '../routes/updateOne';
import deleteOneRoute from '../routes/deleteOne';
import deleteOneByIdRoute from '../routes/deleteOneById';
import countRoute from '../routes/count';

export default (rawOptions) => {
  const options = Joi.attemp(rawOptions, {
    basePath: Joi.string().required(),
    repositoryName: Joi.string().required(),
    parseQuery: Joi.func().default(identity),
    config: Joi.object().default({}),
    schema: Joi.object(),
    parsePayload: Joi.func().default(identity),
    idValidator: Joi.object().type(Joi),
  });

  Object.assign(options, {
    basePath: `${trimEnd(options.basePath, '/')}`,
  });

  const findById = findByIdRoute(options);
  const findMany = findManyRoute(options);
  const findOne = findOneRoute(options);
  const createOne = createOneRoute(options);
  const replaceOne = replaceOneRoute(options);
  const updateOne = updateOneRoute(options);
  const deleteOne = deleteOneRoute(options);
  const deleteOneById = deleteOneByIdRoute(options);
  const count = countRoute(options);

  return {
    findById,
    findMany,
    findOne,
    createOne,
    replaceOne,
    updateOne,
    count,
    deleteOne,
    deleteOneById,
  };
};
