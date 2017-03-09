import Joi from 'joi';
import { ObjectID as objectId } from 'mongodb';
import EJSON from 'mongodb-extended-json';
import ResourceRouter from './ResourceRouter';

export const toBSON = (query) => (
  EJSON.parse(typeof query !== 'string' ? JSON.stringify(query) : query)
);

class MongoResourceRouter extends ResourceRouter {
  constructor(config) {
    super({
      idValidator: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).required(),
      ...config,
    });
  }

  idToQuery = (id) => ({ _id: objectId(id) })
  parseId = objectId
  parseQuery = toBSON
  parsePayload = toBSON
}

export default MongoResourceRouter;
