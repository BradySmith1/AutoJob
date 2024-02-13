const { createProxyMiddleware } = require('http-proxy-middleware')
 
const rewriteAuth = function(path, req) {
    return path.replace("/auth/", "/")
}

const rewriteAPI = function(path, req) {
    return path.replace("/api/", "/")
}

module.exports = function(app) {
  app.use('/auth/*', createProxyMiddleware({ target: 'http://localhost:5000/', pathRewrite: rewriteAuth }));
  app.use('/api/*', createProxyMiddleware({ target: 'http://localhost:3001/', pathRewrite: rewriteAPI }));
}