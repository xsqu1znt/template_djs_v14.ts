import { SlashCommand, PrefixCommand, RawCommand, InteractionCommand } from "@customTypes/commands";

import { Client } from "discord.js";
import * as logger from "@utils/logger";
import * as jt from "@utils/jsTools";
import * as path from "path";

const MODULE_RELATIVE_PATHS = {
    slash: "../../commands/slash",
    prefix: "../../commands/prefix",
    interaction: "../../commands/interaction"
};

const MODULE_DIRECTORIES = {
    slash: path.join(__dirname, MODULE_RELATIVE_PATHS.slash),
    prefix: path.join(__dirname, MODULE_RELATIVE_PATHS.prefix),
    interaction: path.join(__dirname, MODULE_RELATIVE_PATHS.interaction)
};

const MODULE_LOG_PATHS = {
    slash: "commands/slash",
    prefix: "commands/prefix",
    interaction: "commands/interaction"
};

const MODULE_NAME_MATCH = {
    slash: "SLSH",
    prefix: "CMD",
    interaction: "INT"
};

type CommandType = "slash" | "prefix" | "interaction";
type ImportedCommandModule<T> = T extends "slash"
    ? { module: SlashCommand | null; path: string }
    : T extends "prefix"
    ? { module: PrefixCommand | null; path: string }
    : T extends "interaction"
    ? { module: RawCommand | InteractionCommand | null; path: string }
    : { module: null; path: string };

async function importCommandModules<T extends CommandType>(commandType: T): Promise<ImportedCommandModule<T>[]> {
    let _moduleRelativePath: string = "";
    let _moduleDirectory: string = "";
    let _moduleLogPath: string = "";
    let _moduleNameMatch: string = "";

    // Determine the operation variables
    switch (commandType) {
        case "slash":
            _moduleRelativePath = MODULE_RELATIVE_PATHS.slash;
            _moduleDirectory = MODULE_DIRECTORIES.slash;
            _moduleLogPath = MODULE_LOG_PATHS.slash;
            _moduleNameMatch = MODULE_NAME_MATCH.slash;
            break;

        case "prefix":
            _moduleRelativePath = MODULE_RELATIVE_PATHS.prefix;
            _moduleDirectory = MODULE_DIRECTORIES.prefix;
            _moduleLogPath = MODULE_LOG_PATHS.prefix;
            _moduleNameMatch = MODULE_NAME_MATCH.prefix;
            break;

        case "interaction":
            _moduleRelativePath = MODULE_RELATIVE_PATHS.interaction;
            _moduleDirectory = MODULE_DIRECTORIES.interaction;
            _moduleLogPath = MODULE_LOG_PATHS.interaction;
            _moduleNameMatch = MODULE_NAME_MATCH.interaction;
            break;
    }

    let files = jt
        .readDir(_moduleDirectory, { recursive: true })
        .filter(fn => fn.includes(_moduleNameMatch) && (fn.endsWith(".js") || fn.endsWith(".ts")));

    // Import the modules found in the given directory
    let modules: ImportedCommandModule<T>[] = await Promise.all(
        files.map(async fn => {
            let _logPath = path.join(_moduleLogPath, fn);

            try {
                let _path = path.join(_moduleDirectory, fn);
                let _module = (await import(_path)).default;

                return { module: _module, path: _logPath } as ImportedCommandModule<T>;
            } catch (err) {
                // Log the error to the console
                logger.error("$_TIMESTAMP $_IMPORT_COMMAND", `Failed to import command at '${_logPath}'`, err);

                return { module: null, path: _logPath } as ImportedCommandModule<T>;
            }
        })
    );

    return modules;
}

async function importSlashCommandModules() {
    let files = jt
        .readDir(SLSH_MODULE_DIR, { recursive: true })
        .filter(fn => fn.includes("SLSH") && (fn.endsWith(".js") || fn.endsWith(".ts")));

    let importedCommands = {
        public: [] as Array<{ module: SlashCommand; path: string }>,
        staff: [] as Array<{ module: SlashCommand; path: string }>,
        custom: [] as Array<{ module: SlashCommand; path: string }>
    };

    // Import the modules found in the given directory
    let modules = await Promise.all(
        files.map(async fn => {
            try {
                let _path = path.join(SLSH_MODULE_DIR, fn);
                let _module: SlashCommand = (await import(_path)).default;

                return { module: _module, path: path.join("commands/slash", fn) };
            } catch (err) {
                let _errPath = path.join("commands/slash", fn);

                // Log the error to the console
                logger.error("$_TIMESTAMP $_IMPORT_COMMAND", `Failed to import command at '${_errPath}'`, err);

                return { module: null, path: _errPath };
            }
        })
    );

    // Filter the imported modules
    for (let module of modules) {
        if (!module.module) continue;

        let _filename = module.path.split(".").shift();

        // Slash Commands :: { STAFF } (staff server only commands)
        if (_filename?.endsWith("_STAFF")) {
            importedCommands.staff.push(module);
        }
        // Slash Commands :: { CUSTOM } (custom server only commands)
        else if (_filename?.endsWith("_CUS")) {
            importedCommands.custom.push(module);
        }
        // Slash Commands :: { PUBLIC }
        else {
            importedCommands.public.push(module);
        }
    }

    return importedCommands;
}

export default async function (client: Client): Promise<void> {}
