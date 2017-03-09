import Joi from 'joi';

class Router {
  static defaultConfig = {
    basePath: '',
  };

  constructor(config = {}) {
    this.config = {
      ...Router.defaultConfig,
      ...config,
    };

    this.routes = {};
  }

  addRoute = (id, routeConfig) => {
    if (!id) {
      throw new Error('Route id is required!');
    }

    const route = Joi.attempt(routeConfig, {
      method: Joi.string().default('GET'),
      path: Joi.string().required(),
      handler: Joi.func().required(),
      config: Joi.object().default({}),
    });

    this.routes[id] = {
      ...route,
      config: {
        id,
        ...route.config,
      },
    };

    return this;
  }

  getRoutes() {
    return this.routes;
  }

  toArray() {
    return Object.keys(this.routes).reduce((acc, route) => [...acc, route], []);
  }
}

export default Router;
