import WSControl from '../../controllers/wscontroller'
import {IErrorMessage, ErrorMessage, ICmdToServer, IServiceRespond, validationJSON} from '../../types/types'

export class SerialController {

    public static init(host: string){
        WSControl.init(host);
    }

    public static async getHostState(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            const payload = JSON.stringify(request);
            return await WSControl.send(payload)
                .then (validationJSON);
        } catch (e) {
            return ErrorMessage (`Fetch Error: ${e.message}`);
        }
    }

    public static handledDataResponce(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return ErrorMessage (e.message);
        }
    }

    private static handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private static handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

}