import Joi from 'joi';
import Boom from 'boom';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

class Router {
  static defaultConfig = {
    baseRouteConfig: {},
    basePath: '',
  };

  constructor(config = {}) {
    this.config = Joi.attempt({
      ...Router.defaultConfig,
      ...config,
    }, {
      namespace: Joi.string().required(),
      basePath: Joi.string().required(),
      baseRouteConfig: Joi.object().default({}),
    });

    this.routes = {};
  }

  addRoute = (id, routeConfig) => {
    if (!id) {
      throw new Error('Route id is required!');
    }

    if (this.routes[id]) {
      throw new Error(`Route with id ${id} already added!`);
    }

    const route = Joi.attempt(routeConfig, {
      method: Joi.string().default('GET'),
      path: Joi.string().required(),
      handler: Joi.func().required(),
      config: Joi.object().default({}),
    });

    this.routes[id] = {
      ...route,
      handler: this.runHandler(route.handler),
      config: {
        ...this.config.baseRouteConfig,
        id: `${this.config.namespace}:${id}`,
        ...route.config,
      },
    };

    return this;
  }

  getRoutes() {
    return this.routes;
  }

  toArray({ only = [], without = [] }) {
    let ids = Object.keys(this.routes);

    if (only.length) {
      ids = pick(ids, only);
    }

    if (without.length) {
      ids = omit(ids, without);
    }

    return ids.reduce((acc, id) => [...acc, this.routes[id]], []);
  }

  addRouter(router) {
    const routes = router.getRoutes();
    Object.keys(routes).forEach((routeId) => {
      this.addRoute(`${router.config.namespace}:${routeId}`, {
        ...routes[routeId],
        config: {
          ...routes[routeId].config,
          id: `${this.config.namespace}:${router.config.namespace}:${routeId}`,
        },
      });
    });
  }

  runHandler(handler) {
    return async function(request, reply) { // eslint-disable-line func-names
      try {
        reply(await Promise.resolve(handler.call(this, request, reply)));
      } catch (err) {
        reply(Boom.wrap(err));
      }
    };
  }
}

export default Router;
