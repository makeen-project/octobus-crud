import Joi from 'joi';
import { decorators, ServiceContainer } from 'octobus.js';

const { withSchema, service } = decorators;

const limitFields = ({ allowedFields = [], userFields = [] }) => {
  if (!userFields.length) {
    return allowedFields;
  }

  const allowedUserFields = userFields.filter(field => allowedFields.includes(field));

  return allowedUserFields;
};

class CRUDServiceContainer extends ServiceContainer {
  constructor(schema, store) {
    super();
    this.schema = schema;
    this.allowedFields = Object.keys(schema);
    this.setStore(store);
  }

  setStore(store) {
    this.store = store;
  }

  getStore() {
    return this.store;
  }

  @service()
  @withSchema(Joi.func().required())
  query(fn) {
    return fn(this.getStore());
  }

  @service()
  @withSchema(Joi.any().required())
  findById(id) {
    return this.getStore().findOne({
      query: { _id: id },
      options: {
      /* only schema fields must be returned */
        fields: limitFields({
          allowedFields: this.allowedFields,
        }),
      },
    });
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        query: Joi.object(),
        options: Joi.object().default({})
      })
      .default({})
  )
  findOne({ query, options }) {
    return this.getStore().findOne({
      query,
      options: {
        ...options,
        /* only schema fields must be returned */
        fields: limitFields({
          allowedFields: this.allowedFields,
          userFields: options.fields,
        }),
      },
    });
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        query: Joi.object(),
        orderBy: Joi.any(),
        limit: Joi.number(),
        skip: Joi.number(),
        fields: Joi.any()
      })
      .default({})
  )
  findMany(options) {
    return this.getStore().findMany({
      ...options,
      /* only schema fields must be returned */
      fields: limitFields({
        allowedFields: this.allowedFields,
        userFields: options.fields,
      }),
    });
  }

  @service()
  createOne(data) {
    return this.save(data);
  }

  @service()
  @withSchema(Joi.array().min(1).required())
  createMany(data) {
    return Promise.all(data.map(this.save.bind(this)));
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        update: Joi.object().required()
      })
      .unknown(true)
      .required()
  )
  updateOne(data) {
    return this.getStore().updateOne(data);
  }

  @service()
  @withSchema(
    Joi.object()
      .keys({
        update: Joi.object().required()
      })
      .unknown(true)
      .required()
  )
  updateMany(data) {
    return this.getStore().updateMany(data);
  }

  @service()
  @withSchema(Joi.object().unknown(true).required())
  replaceOne(data) {
    return this.save(data);
  }

  async save(data) {
    return this.getStore().save(this.validate(data));
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  deleteOne(data) {
    return this.getStore().deleteOne(data);
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  deleteMany(data) {
    return this.getStore().deleteMany(data);
  }

  @service()
  @withSchema(
    Joi.object().keys({
      query: Joi.object(),
      options: Joi.object()
    })
  )
  count(data) {
    return this.getStore().count(data);
  }

  validate = data => {
    if (!this.schema) {
      return data;
    }

    return Joi.attempt(data, this.schema, {
      convert: true,
      stripUnknown: true,
    });
  };
}

export default CRUDServiceContainer;
