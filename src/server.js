const http = require('http');
const URL = require('url');
const ws = require('ws');

const server = module.exports = {
  create(port, url) {
    const s = {
      port, url, listener: null, ws: null, socket: null
    };
    const httper = http.createServer(server.createListener(s));
    s.ws = new ws.Server({ host: 'localhost', port: 9229, server: httper });
    s.server = httper;
    return s;
  },
  createListener(s) {
    return (req, response) => {
      const url = URL.parse(req.url);
      Promise.resolve(s.listener && s.listener(url.pathname.slice(1)))
        .then(result => {
          response.write(result);
          response.end();
        });
    };
  },
  reload(s) {
    s.socket.send('reload');
  },
  addReload(g, s) {
    const i = g.entry.file.contents.indexOf('<head>') + 6;
    g.entry.file.contents = g.entry.file.contents.slice(0, i) + server.getCode(s) + g.entry.file.contents.slice(i);
  },
  start(s) {
    return new Promise((res, rej) => {
      s.server.listen(s.port);
      s.server.on('listening', () => {
        s.ws.on('connection', socket => { s.socket = socket; res(s); });
      });
      s.server.on('error', rej);
      s.ws.on('error', rej);
    });
  },
  getCode(s) {
    return `(function(){
      var ws = new WebSocket(${s.ws.url});
      ws.onmessage = function (m) {if (m==='reload')location.reload()}
    })()`;
  }
};
