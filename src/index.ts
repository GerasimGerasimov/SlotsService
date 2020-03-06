import {LinkManager} from "./linkmanager/linkmanager";
import HttpServer from "./servers/http/server";
import WSServer from "./servers/ws/server";
import {getConfiguration} from "./utils/utils";

const settings = getConfiguration();
const lm: LinkManager = new LinkManager(settings.host);
const Server: HttpServer = new HttpServer(settings.port, lm);
const WSS: WSServer = new WSServer(Server.https, lm);
console.log('Slots Service started');