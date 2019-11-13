import {LinkManager} from "./linkmanager/linkmanager";
import {AppServer, IServer} from "./server/server"
import {getConfiguration} from "./utils/utils"

const settings = getConfiguration();
const lm: LinkManager = new LinkManager(settings.host);
const Server: IServer = new AppServer(settings.port, lm);
console.log('Slots Service started');
Server.serve();