import Joi from 'joi';
import Boom from 'boom';
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';
import identity from 'lodash/identity';
import pick from 'lodash/pick';
import Router from './Router';

class ResourceRouter extends Router {
  constructor(config) {
    super(
      Joi.attemp(config, {
        basePath: Joi.string().required(),
        repositoryName: Joi.string().required(),
        entitySchema: Joi.object(),
        idValidator: Joi.object().type(Joi),
      })
    );

    const { repositoryName, idValidator } = this.config;

    this.
      addRoute('count', {
        path: '/count',
        method: 'GET',
        handler: this.handleCount,
        config: {
          validate: {
            query: {
              query: Joi.object().default({}),
            },
          },
          description: `Count entities of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.parseQuery(request.query.query)),
            assign: 'query',
          }],
        },
      })
      .addRoute('createOne', {
        path: '/',
        method: 'POST',
        handler: this.handleCreateOne,
        config: {
          validate: {
            payload: this.config.entitySchema,
          },
          description: `Create a new entity of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.parsePayload(request.payload)),
            assign: 'payload',
          }],
        },
      })
      .addRoute('deleteOne', {
        path: '/deleteOne',
        method: 'DELETE',
        handler: this.handleDeleteOne,
        config: {
          validate: {
            payload: {
              query: Joi.object().required(),
            },
          },
          description: `Delete an entity of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.parseQuery(request.query.query)),
            assign: 'query',
          }],
        },
      })
      .addRoute('deleteOneById', {
        path: '/{id}',
        method: 'DELETE',
        handler: this.handleDeleteOne,
        config: {
          validate: {
            params: {
              id: idValidator,
            },
          },
          description: `Delete an entity of type ${repositoryName} by id`,
          pre: [{
            method: (request, reply) => reply(this.idToQuery(request.params.id)),
            assign: 'query',
          }],
        },
      })
      .addRoute('findById', {
        path: '/{id}',
        method: 'GET',
        handler: this.handleFindById,
        config: {
          validate: {
            params: {
              id: idValidator,
            },
          },
          description: `Find an entity of type ${repositoryName} by id`,
          pre: [{
            method: (request, reply) => reply(this.idToQuery(request.params.id)),
            assign: 'query',
          }],
        },
      })
      .addRoute('findMany', {
        path: '/',
        method: 'GET',
        handler: this.handleFindMany,
        config: {
          validate: {
            query: {
              query: Joi.object().default({}),
              offset: Joi.number(),
              limit: Joi.number(),
              orderBy: Joi.object().default({}),
              fields: Joi.object().default({}),
            },
          },
          description: `Find entities of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.parseQuery(request.query.query)),
            assign: 'query',
          }, {
            method: (request, reply) => {
              const params = pick(request.query, ['fields', 'orderBy']);
              params.query = request.pre.query;

              if (request.query.offset !== undefined) {
                params.skip = parseInt(request.query.offset, 10);
              }

              if (request.query.limit !== undefined) {
                params.limit = parseInt(request.query.limit, 10);
              }

              reply(params);
            },
            assign: 'queryParams',
          }],
        },
      })
      .addRoute('findOne', {
        path: '/findOne',
        method: 'GET',
        handler: this.handleFindOne,
        config: {
          validate: {
            query: {
              query: Joi.object().default({}),
            },
          },
          description: `Find one entity of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.parseQuery(request.query.query)),
            assign: 'query',
          }],
        },
      })
      .addRoute('replaceOne', {
        path: '/{id}',
        method: 'PUT',
        handler: this.handleReplaceOne,
        config: {
          validate: {
            params: {
              id: idValidator,
            },
            payload: this.config.entitySchema,
          },
          description: `Replace an entity of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.idToQuery(request.params.id)),
            assign: 'query',
          }, {
            method: (request, reply) => reply(this.parsePayload(request.payload)),
            assign: 'payload',
          }],
        },
      })
      .addRoute('updateOne', {
        path: '/{id}',
        method: 'PATCH',
        handler: this.handleUpdateOne,
        config: {
          validate: {
            params: {
              id: idValidator,
            },
            payload: Joi.object().required(),
          },
          description: `Update an entity of type ${repositoryName}`,
          pre: [{
            method: (request, reply) => reply(this.idToQuery(request.params.id)),
            assign: 'query',
          }, {
            method: (request, reply) => reply(this.parsePayload(request.payload)),
            assign: 'payload',
          }],
        },
      });
  }

  addRoute = (id, routeConfig = {}) => (
    super.addRoute(id, {
      id: this.buildId(id),
      tags: ['api'],
      path: this.buildPath(routeConfig.path),
      pre: [
        {
          method: () => this.getRepository(this.config.repositoryName),
          assign: 'Repository',
        },
        ...(routeConfig.pre || []),
      ],
      ...routeConfig,
    })
  )

  buildId(suffix) {
    return `${this.config.repositoryName}:${suffix}`;
  }

  buildPath(suffix) {
    return trimEnd(
      `${trimEnd(this.config.basePath, '/')}/${trimStart(suffix, '/')}`,
      '/'
    );
  }

  getRepository(request) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented!');
  }
  idToQuery(id) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented!');
  }
  parseId = identity
  parseQuery = identity
  parsePayload = identity

  handleCount(request) {
    const { query, Repository } = request.pre;
    return Repository.count({ query });
  }

  handleCreateOne(request) {
    const { payload, Repository } = request.pre;
    return Repository.createOne(payload);
  }

  handleDeleteOne(request) {
    const { query, Repository } = request.pre;
    return Repository.deleteOne({ query });
  }

  async handleFindById(request) {
    const { query, Repository } = request.pre;
    const id = this.parseId(request.params.id);

    const entity = await Repository.findOne({ query });

    if (!entity) {
      throw Boom.notFound(`Unable to find entity with id ${id}`);
    }

    return entity;
  }

  handleFindMany(request) {
    const { queryParams, Repository } = request.pre;
    return Repository.findMany(queryParams).then((c) => c.toArray());
  }

  async handleFindOne(request) {
    const { query, Repository } = request.pre;
    const entity = await Repository.findOne({ query });

    if (!entity) {
      throw Boom.notFound('Unable to find entity.');
    }

    return entity;
  }

  async handleReplaceOne(request) {
    const { query, payload, Repository } = request.pre;
    const id = this.parseId(request.params.id);
    const entity = await Repository.findOne({ query });

    if (!entity) {
      throw Boom.notFound(`Unable to find entity with id ${id}`);
    }

    return Repository.replaceOne({
      ...entity,
      ...payload,
    });
  }

  async handleUpdateOne(request) {
    const { query, payload, Repository } = request.pre;
    const id = this.parseId(request.params.id);
    const entity = await Repository.findOne({ query });

    if (!entity) {
      throw Boom.notFound(`Unable to find entity with id ${id}`);
    }

    try {
      await Repository.validate({
        ...entity,
        ...payload,
      });
    } catch (err) {
      if (err.isJoi) {
        throw Boom.badRequest(err.details[0].message);
      }

      throw err;
    }

    return Repository.updateOne({
      query,
      update: {
        $set: payload,
      },
    });
  }
}

export default ResourceRouter;
