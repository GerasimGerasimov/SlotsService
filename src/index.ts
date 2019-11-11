import {LinkManager} from "./linkmanager/linkmanager";
import {AppServer, IServer} from "./server/server"

const host: string = 'http://localhost:5000/v1/data/'
const lm: LinkManager = new LinkManager(host);
const Server: IServer = new AppServer(5001, lm);
console.log('Slots Service started');
Server.serve();