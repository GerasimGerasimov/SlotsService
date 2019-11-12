export interface IParsedAnswer {
    addr: Number,
    cmd: Number,
    msg: Array<number>
}

export interface IErrorMessage {
    status: string,
    msg: any
}

export interface IServiceRespond extends IErrorMessage {
    duration?: number,
    time?: Date 
}

export interface ICmdToServer {
    cmd:Array<number>,
    timeOut: Number,
    NotRespond: boolean
}