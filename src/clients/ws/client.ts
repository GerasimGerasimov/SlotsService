import WSControl from './controller'
import {IErrorMessage, ICmdToServer, IServiceRespond} from '../../types/types'

export class SerialController {

    public static init(host: string){
        WSControl.init(host);
    }

    public static async getHostState(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            const payload = JSON.stringify(request);
            return await WSControl.send(payload)
                .then (this.validationJSON);
        } catch (e) {
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            } as IErrorMessage;
        }
    }

    public static handledDataResponce(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    private static validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
        }
    }

    private static handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private static handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

}