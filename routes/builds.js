var Build = require("./../models").Build;

module.exports = {
  create: function (req, res, next) {
    console.log("Running builds.create");
    Build.createWithAppUrl(
      req.params.url_slug,
      req.body,
      function (err, build) {
        if (err) {
          console.log("Creating build failed: ${err}");
          next(err);
        } else {
          console.log("Creating build succeeded");
          res.send(build);
        }
      }
    );
  },
};
