const chalk = require('chalk');
const wrapAnsi = require('wrap-ansi');

export class Log {
    public static success(area: string, message: string): void {
        console.log(wrapAnsi(this.getLogMessage(area, message, 'green'), 20));
    }

    public static error(area: string, message: string): void {
        console.log(wrapAnsi(this.getLogMessage(area, message, 'red'), 20));
    }

    public static info(area: string, message: string): void {
        console.log(wrapAnsi(this.getLogMessage(area, message, 'blue'), 20));
    }

    public static warn(area: string, message: string): void {
        console.log(wrapAnsi(this.getLogMessage(area, message, 'yellow'), 20));
    }

    private static getLogMessage(a: string, m: string, c: string): string {
        return chalk.keyword(c)(`[${a}]`) + m;
    }
}
