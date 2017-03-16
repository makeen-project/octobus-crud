import Joi from 'joi';
import { annotations, decorators, ServiceContainer } from 'octobus.js';

const { service } = annotations;
const { withSchema } = decorators;

class CRUDServiceContainer extends ServiceContainer {
  constructor(store, schema) {
    super();
    this.store = store;
    this.schema = schema;
  }

  @service({
    decorators: [
      withSchema(Joi.func().required())
    ]
  })
  query(fn) {
    return fn(this.store);
  }

  @service({
    decorators: [
      withSchema(Joi.any().required())
    ]
  })
  findById(id) {
    return this.store.findById(id);
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          query: Joi.object(),
          options: Joi.object(),
        }).default({}),
      )
    ]
  })
  findOne({ query, options }) {
    return this.store.findOne({ query, options });
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          query: Joi.object(),
          orderBy: Joi.any(),
          limit: Joi.number(),
          skip: Joi.number(),
          fields: Joi.any(),
        }).default({}),
      ),
    ]
  })
  findMany(options) {
    return this.store.findMany(options);
  }

  @service()
  createOne(data) {
    return this.save(data);
  }

  @service({
    decorators: [
      withSchema(
        Joi.array().min(1).required(),
      ),
    ]
  })
  createMany(data) {
    return Promise.all(data.map(this.save.bind(this)));
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          update: Joi.object().required(),
        }).unknown(true).required(),
      )
    ]
  })
  updateOne(data) {
    return this.store.updateOne(data);
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          update: Joi.object().required(),
        }).unknown(true).required(),
      )
    ],
  })
  updateMany(data) {
    return this.store.updateMany(data);
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().unknown(true).required(),
      ),
    ]
  })
  replaceOne(data) {
    return this.save(data);
  }

  async save(data) {
    return this.store.save(this.validate(data));
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          query: Joi.object(),
          options: Joi.object(),
        }),
      ),
    ]
  })
  deleteOne(data) {
    return this.store.deleteOne(data);
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          query: Joi.object(),
          options: Joi.object(),
        }),
      )
    ],
  })
  deleteMany(data) {
    return this.store.deleteMany(data);
  }

  @service({
    decorators: [
      withSchema(
        Joi.object().keys({
          query: Joi.object(),
          options: Joi.object(),
        }),
      )
    ]
  })
  count(data) {
    return this.store.count(data);
  }

  validate = (data) => {
    if (!this.schema) {
      return data;
    }

    return Joi.attempt(data, this.schema, {
      convert: true,
      stripUnknown: true,
    });
  }
}

export default CRUDServiceContainer;
