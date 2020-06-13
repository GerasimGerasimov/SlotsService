const fetch = require('node-fetch');
import {IErrorMessage, ErrorMessage, ICmdToServer, IServiceRespond, validationJSON} from '../../types/types'

export class SerialController {

    private static host: string;

    public static init(host: string){
        this.host = host;
    }

    public static async getHostState(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body : JSON.stringify(request)
            }
            return await fetch(this.host, header)
                .then (this.handledHTTPResponse)
                .then (validationJSON);
        } catch (e) {
            return ErrorMessage (`Fetch Error: ${e.message}`);
        }
    }

    private static handledHTTPResponse (response: any) {
        if (response.status === 404) throw new Error ('Url not found');
        return response.text();
    }

    public static handledDataResponce(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return ErrorMessage(e.message);
        }
    }

    private static handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private static handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

}