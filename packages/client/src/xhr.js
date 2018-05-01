// We don't want to use jsdom's XHR in our tests :\
if (global.XMLHttpRequest && typeof jest === "undefined") {
  module.exports = global.XMLHttpRequest;
} else {
  // Hack so webpack doesn't try to pull in xmlhttprequest, because it relies
  // on child_process which is unavailable in the browser
  module.exports = eval("require")("xmlhttprequest").XMLHttpRequest;
}
