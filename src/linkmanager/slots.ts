import {IServiceRespond} from '../types/types'

export interface ISlotSet {
    ID: string, //ID слота
    cmd: Array<any>, //команда слейву
    interval?: number //частота активации слота в милисекундах
    NotRespond: boolean;//true - команда в out не требует ответа на неё
    TimeOut: number;//время ожидания ответа устройства
}

export interface ISlot {
    ID: string;    // ID слота для идентификации
    interval: number; //частота запуска слота на выполнение 
    Settings: {
        TimeOut: Number,         // время ожидания ответа в милисекундах
        NotRespond: boolean, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)        
    },
    Flow: {
        //Skip: boolean,      // true - пропустить слот (и перейти к следующему)
    },
    out: Array<any>; // массив с данными (командой) для передачи в устройство
    in: IServiceRespond;  // данные полученные от устройства
    NextTime: number;
}

export class Slot implements ISlot {
    ID:string = '';    // имя слота для идентификации
    interval: number = 1000;
    nextTime: number = 0; //время следующего запуска слота
    Settings = {
        TimeOut: 200,         // время ожидания ответа в милисекундах
        NotRespond: false, // true - команда в out не требует ответа на неё (пропускаю ожидание ответа)        
    };
    Flow = {
        //Skip: false,      // true - пропустить слот (и перейти к следующему)
    };
    out = []; // массив с данными (командой) для передачи в устройство
    in:IServiceRespond = {status:'', msg:[]};  // данные полученными от устройства

    constructor (data: ISlotSet) {
        this.ID = data.ID;
        this.interval = data.interval;
        this.out = data.cmd;
        this.Settings.NotRespond = data.NotRespond;
        this.Settings.TimeOut = data.TimeOut;
        this.nextTime = new Date().getTime();
    }

    get NextTime(): number {
        return this.nextTime;
    }

    set NextTime(time: number) {
        this.nextTime = time;
    }
}