var App = require('./app');
var sql = require('sql');
var utils = require('./utils');

function Channel() {
  this.schema = Channel.schema;
}

Channel.schema = sql.define({
  name: 'channels',
  columns: [
    { name: 'id', dataType: 'serial', primaryKey: true },
    { name: 'app_id', dataType: 'int references apps(id)' },
    { name: 'url_slug', dataType: "varchar(30) NOT NULL CHECK (url_slug <> '')" },
    { name: 'title', dataType: 'varchar(200) NOT NULL' },
    { name: 'language', dataType: 'varchar(10) NOT NULL' },
    { name: 'platform', dataType: 'varchar(20) NOT NULL' },
    { name: 'description', dataType: 'text NOT NULL' }
  ]
});

Channel.create = function(fields, cb) {
  var query = this.schema.insert(fields).returning('*').toQuery();

  utils.findOne(query, cb);
};

Channel.find = function(id, cb) {
  var app = App.schema;
  var query = this.schema.select('channels.*, apps.name AS app_name')
    .from(this.schema.join(app).on(this.schema.app_id.equals(app.id)))
    .where(this.schema.id.equals(id))
    .toQuery();

  utils.findOne(query, cb);
};

Channel.findByChannelUrlSlug = function(url, cb) {
  var app = App.schema;
  var query = this.schema.select('channels.*, apps.name AS app_name')
    .from(this.schema.join(app).on(this.schema.app_id.equals(app.id)))
    .where(this.schema.url_slug.equals(url))
    .toQuery();

  utils.findOne(query, cb);
};

Channel.findAll = function(cb) {
  var app = App.schema;
  var query = this.schema.select('channels.*, apps.name AS app_name')
    .from(this.schema.join(app).on(this.schema.app_id.equals(app.id)))
    .order('channels.title')
    .toQuery();

  utils.findAll(query, cb);
};

Channel.findAllForApp = function(appId, cb) {
  var query = this.schema.select('*')
    .from(this.schema)
    .where(this.schema.app_id.equals(appId))
    .order('channels.title')
    .toQuery();

  utils.findAll(query, cb);
};

Channel.create = function(fields, cb) {
  var query = this.schema.insert(fields).returning('*').toQuery();

  utils.findOne(query, cb);
};

Channel.update = function(fields, cb) {
  var id = fields.id;
  delete fields.id;
  var query = this.schema.update(fields)
    .where(this.schema.id.equals(id))
    .returning('*').toQuery();

  utils.findOne(query, cb);
};

module.exports = Channel;
