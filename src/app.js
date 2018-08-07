import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import Webview from "./renderers/webview";

new Webview("http://concretego.com/");
