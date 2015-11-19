module.exports = {
  bootstrap: require('./bootstrap'),

  buildNotesUrl: function(rootUrl, appcast, build) {
    var url = 'apps/:url_slug/:channel_url_slug/release-notes/:version.html';
    url = url.replace(/:url_slug/, appcast.app.url_slug);
    url = url.replace(/:channel_url_slug/, appcast.channel.url_slug);
    url = url.replace(/:version/, build.version);

	if (rootUrl.substr(-1) != '/') rootUrl += '/';
    return rootUrl + url;
  },

  downloadUrl: function(rootUrl, build, channel) {
	if (rootUrl.substr(-1) != '/') rootUrl += '/';
    var template = rootUrl + 'apps/:url_slug/:channel_url_slug/download/:version/:filename';
    template = template.replace(/:url_slug/, channel.app_url_slug);
    template = template.replace(/:channel_url_slug/, channel.url_slug);
    template = template.replace(/:version/, build.version);
    template = template.replace(/:filename/, build.filename);
    return template;
  },

  formatters: require('./formatters')
};
