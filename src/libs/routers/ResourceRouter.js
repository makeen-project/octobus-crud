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
        baseRouteConfig: Joi.object().default({}),
        entitySchema: Joi.object(),
        idValidator: Joi.object().type(Joi),
      })
    );

    const { repositoryName } = this.config;

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
              id: this.config.idValidator,
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
              id: this.config.idValidator,
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
              id: this.config.idValidator,
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
              id: this.config.idValidator,
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

  addRoute = (id, routeConfig) => (
    super.addRoute(this.buildId(id), {
      ...this.config.baseRouteConfig,
      ...routeConfig,
      tags: ['api'],
      path: this.buildPath(routeConfig.path),
      pre: [
        {
          method: () => this.getRepository(this.config.repositoryName),
          assign: 'Repository',
        },
        ...(routeConfig.pre || []),
      ],
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

  async handleCount(request, reply) {
    const { query, Repository } = request.pre;

    try {
      reply(await Repository.count({ query }));
    } catch (err) {
      reply(Boom.wrap(err));
    }
  }

  async handleCreateOne(request, reply) {
    const { payload, Repository } = request.pre;

    try {
      reply(await Repository.createOne(payload));
    } catch (err) {
      reply(Boom.wrap(err));
    }
  }

  async handleDeleteOne(request, reply) {
    const { query, Repository } = request.pre;

    try {
      reply(await Repository.deleteOne({ query }));
    } catch (err) {
      reply(Boom.wrap(err));
    }
  }

  async handleFindById(request, reply) {
    const { query, Repository } = request.pre;
    const id = this.parseId(request.params.id);

    try {
      const entity = await Repository.findOne({ query });

      if (!entity) {
        return reply(Boom.notFound(`Unable to find entity with id ${id}`));
      }

      return reply(entity);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  }

  async handleFindMany(request, reply) {
    const { queryParams, Repository } = request.pre;

    try {
      reply(
        await Repository.findMany(queryParams).then((c) => c.toArray()),
      );
    } catch (err) {
      reply(Boom.wrap(err));
    }
  }

  async handleFindOne(request, reply) {
    const { query, Repository } = request.pre;

    try {
      const entity = await Repository.findOne({ query });

      if (!entity) {
        return reply(Boom.notFound('Unable to find entity.'));
      }

      return reply(entity);
    } catch (err) {
      return Boom.wrap(err);
    }
  }

  async handleReplaceOne(request, reply) {
    const { query, payload, Repository } = request.pre;
    const id = this.parseId(request.params.id);

    try {
      const entity = await Repository.findOne({ query });

      if (!entity) {
        return reply(Boom.notFound(`Unable to find entity with id ${id}`));
      }

      const result = await Repository.replaceOne({
        ...entity,
        ...payload,
      });

      return reply(result);
    } catch (err) {
      return reply(Boom.wrap(err));
    }
  }

  async handleUpdateOne(request, reply) {
    const { query, payload, Repository } = request.pre;
    const id = this.parseId(request.params.id);

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
        query: this.idToQuery(request.params.id),
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
  }
}

export default ResourceRouter;
