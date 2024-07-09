import chalk from "chalk";

export function debug(msg: string) {
    console.log(chalk.magenta(msg));
}

export function error(header: string, msg: string, err: any = "") {
    console.error(chalk.black.bgRed(header) + " " + chalk.magenta(msg), err);
}

export function log(msg: string) {
    console.log(chalk.gray(msg));
}

export function success(msg: string) {
    console.log(chalk.gray(msg));
}
