class Webview {
  constructor(url) {
    const view = document.createElement("webview");

    view.setAttribute("server", url);
    view.setAttribute("src", url);
    view.setAttribute("disablewebsecurity", "on");

    this._webview = view;

    document.body.appendChild(view);
  }
}

export default Webview;
