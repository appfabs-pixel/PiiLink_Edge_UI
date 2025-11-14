const { createProxyMiddleware } = require("http-proxy-middleware");


const edgeXTarget = {
  target: "https://localhost:8443",
  changeOrigin: true,
  secure: false, 
};

module.exports = function (app) {
  
  app.use(
    "/v1",
    createProxyMiddleware({
      target: "http://localhost:8200",
      changeOrigin: true,
      secure: false,
    })
  );

  
  app.use("/core-data", createProxyMiddleware(edgeXTarget)); 
 
  app.use("/core-metadata", createProxyMiddleware(edgeXTarget)); 
  app.use("/core-keeper", createProxyMiddleware(edgeXTarget));
  app.use("/core-command", createProxyMiddleware(edgeXTarget));

  app.use("/support-notifications", createProxyMiddleware(edgeXTarget));
  app.use("/support-scheduler", createProxyMiddleware(edgeXTarget));


  app.use("/device-virtual", createProxyMiddleware(edgeXTarget));
  app.use("/device-rest", createProxyMiddleware(edgeXTarget));
  app.use("/app-rules-engine", createProxyMiddleware(edgeXTarget));
  app.use("/security-proxy-auth", createProxyMiddleware(edgeXTarget));
  

  app.use("/device-mqtt", createProxyMiddleware(edgeXTarget));
  app.use("/device-opcua", createProxyMiddleware(edgeXTarget));
};