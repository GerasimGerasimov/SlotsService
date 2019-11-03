export interface ISlot {
    ID: string;    // ID слота для идентификации    
    State: {
        ErrPort: boolean,   // ошибка последовательного порта (например, он закрыт)
        ErrTimeOut: boolean,// ответ устройства не получен
        ErrCRC: boolean     // ответ есть но неправильная контрольная сумма    
    },
    Settings: {
        TimeOut: Number,         // время ожидания ответа в милисекундах
        BeforeWriteTime: Number, // задержка перед отправкой следующего запроса
    },
    Flow: {
        Skip: boolean,      // true - пропустить слот (и перейти к следующему)
        NoRespond: boolean, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)
        Change: boolean     // true - перейти к следующему слоту
    },
    out: Array<any>; // массив с данными (командой) для передачи в устройство
    in: Array<any>;  // массив с данными полученными от устройства
    onRead?: (...args: any[]) => void // callback функция которую требуется вызвать по получению даных от устройства (даже если есть ошибки)
}

export class Slot implements ISlot {
    ID:string = '';    // имя слота для идентификации    
    State = {
        ErrPort: false,   // ошибка последовательного порта (например, он закрыт)
        ErrTimeOut: false,// ответ устройства не получен
        ErrCRC: false     // ошибка контрольной суммы    
    };
    Settings = {
        TimeOut: 200,         // время ожидания ответа в милисекундах
        BeforeWriteTime: 2, // задержка перед отправкой следующего запроса
    };
    Flow = {
        Skip: false,      // true - пропустить слот (и перейти к следующему)
        NoRespond: false, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)
        Change: false,    // true - перейти к следующему слоту
    };
    out = []; // массив с данными (командой) для передачи в устройство
    in = [];  // массив с данными полученными от устройства
    onRead = null// callback функция которую требуется вызвать по получению даных от устройства (даже если есть ошибки)

    constructor (data: any, callback: Function) {
        this.out = data;
        this.onRead = callback;
    }
}