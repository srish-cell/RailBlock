
import http from 'http'
import app from './server'
// Remember this creates a web server that is accessible by calling the http link
const server = http.createServer(app)
let currentApp = app
server.listen(3000)


// Check if the interface is accessible
if (module.hot) { 
  // We are accepting an undated module.
  console.log('\x1b[36m%s\x1b[0m', "Cyan Status index.js Server", module.hot.status());

  module.hot.accept('./server', () => {
    server.removeListener('request', currentApp)
  server.on('request', app)
  currentApp = app
 })
}
