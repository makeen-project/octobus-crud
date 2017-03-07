export default class Store {
  constructor(options = {}) {
    this.options = options;
  }

  findOne({ query = {}, options = {} }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  findMany({ query = {}, orderBy, limit, skip, fields }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  findById(id) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  insert(data) {
    return Array.isArray(data) ? this.insertMany(data) : this.insertOne(data);
  }

  insertOne(data) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  insertMany(data) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  replaceOne(query, data) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  save(data) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  deleteMany({ query = {}, options = {} }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  deleteOne(params) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  updateMany({ query = {}, update, options = {} }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  updateOne({ query = {}, update, options = {} }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }

  count({ query = {}, options = {} }) { // eslint-disable-line
    throw new Error('Not implemented!');
  }
}
