var Client = require('./../../models').Client;
var errors = require('./../../errors');

module.exports = {
  index: function(req, res, next) {
    Client.findAll(function(err, clients) {
      if (err) return next(err);
      res.render('admin/clients/index', { flash: req.flash(), clients: clients });
    });
  },

  new: function(req, res, next) {
    res.render('admin/clients/new', { flash: req.flash(), r_client: {} });
  },

  create: function(req, res, next) {
    Client.register(req.body.r_client.name, req.body.r_client.password, function(err, r_client) {
      if (err) {
        res.flash.error(err);
        res.render('admin/clients/new', { flash: req.flash(), r_client: req.body.r_client });
      } else {
        res.flash.success('Client saved');
        res.redirect('/admin/clients/' + r_client.id);
      }
    });
  },

  delete: function(req, res, next) {
    Client.delete(req.params.id, function(err) {
      if (err) return next(err);
      res.flash.success('Client deleted');
      res.redirect('/admin/clients');
    });
  },

  patch: function(req, res, next) {
    var fields = req.body.r_client;
    fields.id = req.params.id;

    Client.update(fields, function(err, r_client) {
      if (err) {
        res.flash.error(err);
        res.render('admin/clients/edit', { flash: req.flash(), r_client: fields });
      } else {
        res.flash.success('Client saved');
        res.render('admin/clients/edit', { flash: req.flash(), r_client: r_client });
      }
    });
  },

  show: function(req, res, next) {
    Client.find(req.params.id, function(err, r_client) {
      if (err) return next(err);
      if (!r_client) return next(new errors.NotFound('Client not found'));
      res.render('admin/clients/edit', { flash: req.flash(), r_client: r_client });
    });
  }
};
