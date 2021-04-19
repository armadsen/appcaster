var errors = require("./errors");
var express = require("express");
var expressLayouts = require("express-ejs-layouts");
var app = express();
var config = require("./config");
var routes = require("./routes");
var middleware = require("./middleware");
var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
var db = require("./db");
var Build = require("./models/build");
var logger = require("morgan");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var basicAuth = require("express-basic-auth");

app.locals = require("./helpers");
app.locals.rootUrl = config.rootUrl;
console.log("Started running at " + config.rootUrl);

app.use(express.static("public"));
app.use("/js/marked/", express.static("./node_modules/marked/lib/"));

app.use(logger("combined"));

app.use(express.json());
app.use(express.urlencoded());
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);
app.use(cookieParser());
app.use(cookieSession({ secret: "Gorm Quarterly" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(middleware.flash);

app.use(expressLayouts);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.set("layout", "layout");

function userFromGitHub(profile) {
  return {
    name: profile.displayName,
    username: profile.username,
  };
}

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.client_id,
      clientSecret: config.github.secret,
      callbackURL: config.github.callback,
    },
    function (accessToken, refreshToken, profile, done) {
      if (config.users.github.indexOf(profile.username) !== -1) {
        done(null, userFromGitHub(profile));
      } else {
        done(new errors.AuthError("User not authorized"));
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get("/", function (res, req) {
  req.redirect("/admin");
});

app.get("/auth/github", passport.authenticate("github"));

function authSuccess(req, res) {
  console.log("Auth finished");
  res.redirect("/admin/apps");
}

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/admin/session/error",
  }),
  authSuccess
);

app.post("/apps/:url_slug/builds", middleware.apiAuth(), routes.builds.create);
app.get("/apps/:url_slug/:channel_url_slug/appcast.xml", routes.apps.show);

app.get(
  "/apps/:url_slug/:channel_url_slug/download/latest",
  routes.apps.downloadLatest
);
app.get(
  "/apps/:url_slug/:channel_url_slug/download/latest_dmg",
  routes.apps.downloadLatestDMG
);
app.get(
  "/apps/:url_slug/:channel_url_slug/download/:version/:filename",
  routes.apps.download
);
app.get(
  "/apps/:url_slug/:channel_url_slug/release-notes/:version.html",
  routes.apps.releaseNotes
);
app.get(
  "/apps/:url_slug/:channel_url_slug/release-notes/latest",
  routes.apps.latestReleaseNotes
);

app.all("/admin/*", middleware.requiresUser, middleware.navigation);
app.get("/admin", middleware.redirectIfSignedIn, routes.admin.index);
app.post("/admin/session", routes.admin.session.create);
app.get("/admin/session/error", routes.admin.session.error);
app.delete("/admin/session", routes.admin.session.delete);

app.get("/admin/apps", routes.admin.apps.index);
app.post("/admin/apps", routes.admin.apps.create);
app.get("/admin/apps/new", routes.admin.apps.new);
app.get("/admin/apps/:id", routes.admin.apps.show);
app.patch("/admin/apps/:id", routes.admin.apps.patch);
app.delete("/admin/apps/:id", routes.admin.apps.delete);

app.get("/admin/channels", routes.admin.channels.index);
app.post(
  "/admin/channels",
  middleware.loadAllApps,
  routes.admin.channels.create
);
app.get(
  "/admin/channels/new",
  middleware.loadAllApps,
  routes.admin.channels.new
);
app.get(
  "/admin/channels/:id",
  middleware.loadAllApps,
  routes.admin.channels.show
);
app.patch(
  "/admin/channels/:id",
  middleware.loadAllApps,
  routes.admin.channels.patch
);
app.delete("/admin/channels/:id", routes.admin.channels.delete);

app.get("/admin/clients", routes.admin.clients.index);
app.post("/admin/clients", middleware.loadAllApps, routes.admin.clients.create);
app.get("/admin/clients/new", middleware.loadAllApps, routes.admin.clients.new);
app.get(
  "/admin/clients/:id",
  middleware.loadAllApps,
  routes.admin.clients.show
);
app.patch(
  "/admin/clients/:id",
  middleware.loadAllApps,
  routes.admin.clients.patch
);
app.delete("/admin/clients/:id", routes.admin.clients.delete);

app.get("/admin/builds*", function (req, res, next) {
  res.locals.buildHelpers = require("./helpers/builds");
  next();
});
app.get("/admin/builds", routes.admin.builds.index);
app.post("/admin/builds", middleware.loadAllApps, routes.admin.builds.create);
app.get("/admin/builds/new", middleware.loadAllApps, routes.admin.builds.new);
app.get("/admin/builds/:id", middleware.loadAllApps, routes.admin.builds.show);
app.get(
  "/admin/builds/:id/edit",
  middleware.loadAllApps,
  routes.admin.builds.edit
);
app.patch(
  "/admin/builds/:id",
  middleware.loadAllApps,
  routes.admin.builds.patch
);
app.get(
  "/admin/builds/:id/release",
  middleware.loadAllApps,
  routes.admin.builds.release
);
app.put(
  "/admin/builds/:id/releases",
  middleware.loadAllApps,
  routes.admin.builds.releases
);
app.delete("/admin/builds/:id", routes.admin.builds.delete);

app.use(function (req, res, next) {
  next(new errors.NotFound("Page not found"));
});

app.use(function (err, req, res, next) {
  if (!err.statusCode) {
    console.error(err);
    console.error(err.stack);
  }

  res.status(err.statusCode || 500);
  res.render("error", { err: err });
});

app.on("build:downloaded", Build.countDownload);

module.exports = app;
