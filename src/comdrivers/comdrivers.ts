export interface ICommunicationDriver extends CommunicationDriver{
    addCtrlToMessage( msg: any): any;
    validateRespond (msg: any): any;
}

export abstract class CommunicationDriver {
    constructor (settings: any) {}
    abstract addCtrlToMessage( msg: any): any;
    abstract validateRespond (msg: any): any;
}