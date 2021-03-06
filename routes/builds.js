var Build = require('./../models').Build;

module.exports = {
  create: function(req, res, next) {
    Build.createWithAppUrl(req.params.url_slug, req.body, function(err, build) {
      if (err) {
        next(err);
      } else {
        res.send(build);
      }
    });
  }
};
