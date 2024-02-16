const { createProxyMiddleware } = require('http-proxy-middleware')
 
const rewriteAuth = function(path, req) {
    return path.replace("/auth/", "/")
}

const rewriteAPI = function(path, req) {
    return path.replace("/api/", "/")
}

module.exports = function(app) {
  app.use('/auth/*', createProxyMiddleware({ target: 'https://auth.smith-household.com', changeOrigin: true, pathRewrite: rewriteAuth }));
  app.use('/api/*', createProxyMiddleware({ target: 'https://resource.smith-household.com', changeOrigin: true, pathRewrite: rewriteAPI }));
}