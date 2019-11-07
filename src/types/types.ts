export interface IParsedAnswer {
    addr: Number,
    cmd: Number,
    msg: Array<Number>
}

export interface IErrorMessage {
    status: String,
    msg: String
}