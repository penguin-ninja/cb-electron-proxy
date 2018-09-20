import express, { Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import env from 'env';
import SoftPAC from './pac';

class Proxy extends EventEmitter {
  constructor() {
    super();

    const app = express();

    // allowing CORS
    app.use(cors());

    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }));

    this.app = app;
    this.pac = new SoftPAC();
    this.queue = [];
    this.setupRoutes();
    this.startServer();
  }

  setupRoutes() {
    const router = Router();
    router.get('/run', this.runPAC.bind(this));
    this.app.use('/', router);
  }

  runPAC(req, res) {
    console.log(`Received Request - ${JSON.stringify(req.query.command)}`);
    const timestamp = new Date().valueOf();

    this.emit('proxy-log', {
      status: 'normal',
      message: req.query.command,
      title: `Request (${new Date().toLocaleString()}): `
    });

    if (this.running) {
      this.queue.push({ req, res });

      this.emit('proxy-log', {
        status: 'error',
        message: `Queuing. Current Queue Size: ${this.queue.length}`,
        title: `Pac Busy: `
      });
      return;
    }

    this.running = true;

    this.pac
      .run(req.query.command)
      .then(result => {
        if (result.indexOf('ERROR') > -1) {
          throw new Error(result.replace('ERROR', '').trim());
        }

        const response = result.replace('OK', '').trim();

        this.emit('proxy-log', {
          status: 'success',
          message: response,
          title: `Success (+${new Date().valueOf() - timestamp}ms): `
        });

        res.send({ result: response });
        this.running = false;
      })
      .catch(err => {
        const message = err ? err.message : 'Unknown error';

        this.emit('proxy-log', {
          status: 'error',
          message,
          title: `Error (+${new Date().valueOf() - timestamp}ms): `
        });

        res.status(400).send({
          message
        });
        this.running = false;
      })
      .then(() => {
        if (this.queue.length) {
          const item = this.queue.shift();
          this.runPAC(item.req, item.res);
        }
      });
  }

  startServer() {
    const listen = promisify(this.app.listen).bind(this.app);

    return listen(env.proxyPort).then(() => {
      console.log(`Started proxy at ${env.proxyPort}`);
      return this.app;
    });
  }
}

export default Proxy;
