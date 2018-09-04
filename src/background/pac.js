import net from 'net';
import env from 'env';

class SoftPAC {
  constructor() {
    this.client = new net.Socket();
    this.client.connect(
      env.pacPort,
      env.pacHost,
      () => {
        console.log(`Connected to PAC ${env.pacHost}:${env.pacPort}`);

        this.run('get-version');
      }
    );

    this.client.on('close', () => {
      console.log(`Connection closed with PAC`);
    });
  }

  run(command) {
    const { client } = this;

    return new Promise((resolve, reject) => {
      try {
        client.write(`${command}\r\n`);

        const handler = data => {
          const str = data.toString();
          console.log('Received from PAC: ' + str);

          if (str.trim() === 'hello') {
            console.log('Received hello :/. waiting for next output');
            client.once('data', handler);
            return;
          }

          resolve(str);
        };

        client.once('data', handler);
        client.once('error', err => {
          reject(err);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  destroy() {
    this.client.destroy();
  }
}

export default SoftPAC;
