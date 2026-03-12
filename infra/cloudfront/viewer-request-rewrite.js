function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
    return request;
  }

  if (uri.indexOf(".") === -1) {
    request.uri = uri + ".html";
  }

  return request;
}
