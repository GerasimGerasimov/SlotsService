export interface IParsedAnswer {
    addr: Number,
    cmd: Number,
    msg: Array<Number>
}

export interface IErrorMessage {
    status: String,
    msg: String
}

export interface IServiceRespond extends IErrorMessage {
    duration?: Number,
    time?: Date 
}

export interface ICmdToServer {
    cmd:Array<Number>,
    timeOut: Number,
    NotRespond: boolean
}