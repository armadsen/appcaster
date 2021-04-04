var Appcast = require('./../models').Appcast;
var Build = require('./../models').Build;
var config = require('./../config');
var errors = require('./../errors');
var marked = require('marked');

module.exports = {
  create: function(req, res, next) {
  },

  show: function(req, res, next) {
    Appcast.find({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug
    }, function(err, appcast) {
      if (!appcast) {
        return res.send(200);
      }

      res.set('Content-Type', 'application/xml');

      res.render('appcast', {
        appcast: appcast,
        app: appcast.app,
        builds: appcast.builds,
        channel: appcast.channel,
        layout: false,
        url: req.url,
        urlRoot: config.rootUrl
      });
    });
  },

  download: function(req, res, next) {
    Appcast.findBuildByVersion({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug,
      version: req.params.version
    }, function(err, appcast) {
      if (err) return next(err);

      if (!appcast) {
        return next(new errors.NotFound('Appcast not found'));
      }

      req.app.emit('build:downloaded', appcast.build);

      res.redirect(appcast.build.download_url);
    });
  },

  downloadLatest: function(req, res, next) {
    Appcast.findLatest({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug
    }, function(err, appcast) {
      if (err) return next(err);

      if (!appcast) {
        return next(new errors.NotFound('Appcast not found'));
      }

      req.app.emit('build:downloaded', appcast.build);

      res.redirect(appcast.build.download_url);
    });
  },

  downloadLatestDMG: function(req, res, next) {
    Appcast.findLatest({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug
    }, function(err, appcast) {
      if (err) return next(err);

      if (!appcast) {
        return next(new errors.NotFound('Appcast not found'));
      }

      req.app.emit('build:downloaded', appcast.build);
	
	  var dmgURL = appcast.build.download_url.replace(/\.(zip)($|\?)/, '.dmg$2')
      res.redirect(dmgURL);
    });
  },

  releaseNotes: function(req, res, next) {
    Appcast.findBuildByVersion({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug,
      version: req.params.version
    }, function(err, appcast) {
      if (err) return next(err);

      if (!appcast) {
        return next(new errors.NotFound('Appcast not found'));
      }

      res.render('release_notes', {
        appcast: appcast,
        build: appcast.build,
        notes: marked(appcast.build.notes || ''),
        layout: 'release-notes-layout'
      });
    });
  },

  latestReleaseNotes: function(req, res, next) {
    Appcast.findLatest({
      app_url: req.params.url_slug,
      channel_url: req.params.channel_url_slug
    }, function(err, appcast) {
      if (err) return next(err);

      if (!appcast) {
        return next(new errors.NotFound('Appcast not found'));
      }

      res.render('release_notes', {
        appcast: appcast,
        build: appcast.build,
        notes: marked(appcast.build.notes || ''),
        layout: 'release-notes-layout'
      });
    });
  }
};
