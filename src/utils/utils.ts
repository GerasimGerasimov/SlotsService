import fs = require('fs');

export function getConfiguration (): any {
    console.log('Slots Service init');
    let settings = getArguments();
    //если передано имя файла, то параметры читать из него
    if (settings.filename !== "") {
            settings = JSON.parse(fs.readFileSync(settings.filename, 'utf8'));
        }
    console.log(`host: ${settings.host}`);
    console.log(`port: ${settings.port}`);
    return settings;
}

function getArguments():any {
    let nodePath = process.argv[0];
    let appPath  = process.argv[1];
    let filename: string = process.argv[2];
    let host: string     = process.argv[3];//адрес хоста SerialService
    let port: string     = process.argv[4];//порт сервера SlotsSetver
    // console.log(`nodePath: ${nodePath}`);
    // console.log(`appPath: ${appPath}`);
    // console.log(`filename: ${filename}`);
    // console.log(`host: ${host}`);
    // console.log(`port: ${port}`);
    return {filename, host, port};
}