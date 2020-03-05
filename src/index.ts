import {LinkManager} from "./linkmanager/linkmanager";
import {HttpServer} from "./servers/httpserver"
import {getConfiguration} from "./utils/utils"

const settings = getConfiguration();
const lm: LinkManager = new LinkManager(settings.host);
const Server: HttpServer = new HttpServer(settings.port, lm);
console.log('Slots Service started');