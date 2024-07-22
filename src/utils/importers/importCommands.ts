import { SlashCommand, PrefixCommand, InteractionCommand } from "@customTypes/commands";

import { Client } from "discord.js";
import logger from "@utils/logger";
import jt from "@utils/jsTools";
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
    ? { module: InteractionCommand | null; path: string }
    : never;

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
            let _path = path.join(_moduleDirectory, fn);
            let _logPath = path.join(_moduleLogPath, fn);
            let _module = await import(_path)
                .then(m => m.default)
                .catch(err => {
                    // Log the error to the console
                    logger.error("$_TIMESTAMP $_IMPORT_COMMAND", `Failed to import command module at '${_logPath}'`, err);
                    return null;
                });

            return { module: _module, path: _logPath } as ImportedCommandModule<T>;
        })
    );

    return modules;
}

async function importSlashCommands() {
    let importedCommands = {
        public: [] as ImportedCommandModule<"slash">[],
        staff: [] as ImportedCommandModule<"slash">[],
        custom: [] as ImportedCommandModule<"slash">[]
    };

    // Import the command modules
    let modules = await importCommandModules("slash");

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

async function importPrefixCommands() {
    let importedCommands = {
        public: [] as ImportedCommandModule<"prefix">[],
        staff: [] as ImportedCommandModule<"prefix">[],
        custom: [] as ImportedCommandModule<"prefix">[]
    };

    // Import the command modules
    let modules = await importCommandModules("prefix");

    // Filter the imported modules
    for (let module of modules) {
        if (!module.module) continue;

        let _filename = module.path.split(".").shift();

        // Prefix Commands :: { STAFF } (staff server only commands)
        if (_filename?.endsWith("_STAFF")) {
            importedCommands.staff.push(module);
        }
        // Prefix Commands :: { CUSTOM } (custom server only commands)
        else if (_filename?.endsWith("_CUS")) {
            importedCommands.custom.push(module);
        }
        // Prefix Commands :: { PUBLIC }
        else {
            importedCommands.public.push(module);
        }
    }

    return importedCommands;
}

async function importInteractionCommands() {
    let importedCommands = {
        contextMenu: [] as ImportedCommandModule<"interaction">[],
        userInstall: [] as ImportedCommandModule<"interaction">[]
    };

    // Import the command modules
    let modules = await importCommandModules("interaction");

    // Filter the imported modules
    for (let module of modules) {
        if (!module.module) continue;

        let _filename = module.path.split(".").shift();

        // Interaction Commands :: { CONTEXT MENU }
        if (_filename?.endsWith("_CTX")) {
            importedCommands.contextMenu.push(module);
        }
        // Interaction Commands :: { USER INSTALL }
        else if (_filename?.endsWith("_UI")) {
            importedCommands.userInstall.push(module);
        }
    }

    return importedCommands;
}

export default async function (client: Client): Promise<void> {
    const importedCommands = {
        slash: await importSlashCommands(),
        prefix: await importPrefixCommands(),
        interaction: await importInteractionCommands()
    };

    // Add the imported slash commands to the client
    for (let [k, v] of Object.entries(importedCommands.slash)) {
        for (let command of v) {
            if (!command.module) continue;
            client.commands.slash.all.set(command.module.builder.name, command.module);
            client.commands.slash[k as "public" | "staff" | "custom"].set(command.module.builder.name, command.module);

            logger.importer.commandImport(command.module.builder.name, command.path, "slash");
        }
    }

    // Add the imported prefix commands to the client
    for (let [k, v] of Object.entries(importedCommands.prefix)) {
        for (let command of v) {
            if (!command.module) continue;
            client.commands.prefix.all.set(command.module.name, command.module);
            client.commands.prefix[k as "public" | "staff" | "custom"].set(command.module.name, command.module);

            logger.importer.commandImport(command.module.name, command.path, "prefix");

            // Apply aliases
            if (command.module.aliases) {
                for (let alias of command.module.aliases) {
                    client.commands.prefix.all.set(alias, command.module);
                    client.commands.prefix[k as "public" | "staff" | "custom"].set(alias, command.module);

                    logger.importer.commandImport(`${command.module.name} -> @${alias}`, "", "prefix");
                }
            }
        }
    }

    // Add the imported interaction commands to the client
    for (let [k, v] of Object.entries(importedCommands.interaction)) {
        for (let command of v) {
            if (!command.module) continue;

            let _name = command.module.raw?.name || command.module.builder?.name;
            if (!_name) continue;

            client.commands.interaction.all.set(_name, command.module);
            client.commands.interaction[k as "contextMenu" | "userInstall"].set(_name, command.module);

            logger.importer.commandImport(_name, command.path, "interaction");
        }
    }
}
