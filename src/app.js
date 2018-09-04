import { ipcRenderer } from 'electron';
import './stylesheets/main.css';

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// import Webview from "./renderers/webview";
//
// new Webview("http://concretego.com/");

const logsEl = document.getElementById('logs');

function addLog(title, message, status = 'normal') {
  const log = document.createElement('div');
  log.setAttribute('class', `log-item-${status}`);
  log.innerHTML = `<b>${title}</b> ${message}`;
  logsEl.appendChild(log);

  // stick scroll to bottom
  if (logsEl.scrollTop >= logsEl.scrollHeight - 50) {
    logsEl.scrollTop = logsEl.scrollHeight;
  }
}

ipcRenderer.on('proxy-log', (event, args) => {
  addLog(args.title, args.message, args.status);
});
