import { SlashCommand, PrefixCommand, ContextMenuCommand, UserInstallableCommand } from "@customTypes/commands";

import { Client } from "discord.js";
import AppCommandManager from "@utils/AppCommandManager";
import logger from "@utils/logger";
import jsTools from "jstools";
import path from "node:path";

const MODULE_RELATIVE_PATHS = {
    slash: "../../commands/slash",
    prefix: "../../commands/prefix",
    special: "../../commands/special"
};

const MODULE_DIRECTORIES = {
    slash: path.join(__dirname, MODULE_RELATIVE_PATHS.slash),
    prefix: path.join(__dirname, MODULE_RELATIVE_PATHS.prefix),
    special: path.join(__dirname, MODULE_RELATIVE_PATHS.special)
};

const MODULE_LOG_PATHS = {
    slash: "commands/slash",
    prefix: "commands/prefix",
    special: "commands/special"
};

const MODULE_NAME_MATCH = {
    slash: ["SLSH"],
    prefix: ["PRFX"],
    special: ["CTX", "UI"]
};

type CommandType = "slash" | "prefix" | "contextMenu" | "userInstall";
type ImportedCommandModule<T> = T extends "slash"
    ? { module: SlashCommand | null; path: string }
    : T extends "prefix"
      ? { module: PrefixCommand | null; path: string }
      : T extends "contextMenu"
        ? { module: ContextMenuCommand | null; path: string }
        : T extends "userInstall"
          ? { module: UserInstallableCommand | null; path: string }
          : never;

async function importCommandModules<T extends CommandType>(commandType: T): Promise<ImportedCommandModule<T>[]> {
    let _moduleDirectory: string = "";
    let _moduleLogPath: string = "";
    let _moduleNameMatch: string[] = [];

    // Determine the operation variables
    switch (commandType) {
        case "slash":
            _moduleDirectory = MODULE_DIRECTORIES.slash;
            _moduleLogPath = MODULE_LOG_PATHS.slash;
            _moduleNameMatch = MODULE_NAME_MATCH.slash;
            break;

        case "prefix":
            _moduleDirectory = MODULE_DIRECTORIES.prefix;
            _moduleLogPath = MODULE_LOG_PATHS.prefix;
            _moduleNameMatch = MODULE_NAME_MATCH.prefix;
            break;

        case "contextMenu":
        case "userInstall":
            _moduleDirectory = MODULE_DIRECTORIES.special;
            _moduleLogPath = MODULE_LOG_PATHS.special;
            _moduleNameMatch = MODULE_NAME_MATCH.special;
            break;
    }

    let files = jsTools
        .readDir(_moduleDirectory, { recursive: true })
        .filter(fn => _moduleNameMatch.find(m => fn.includes(m)) && (fn.endsWith(".js") || fn.endsWith(".ts")));

    // Import the modules found in the given directory
    let modules: ImportedCommandModule<T>[] = await Promise.all(
        files.map(async fn => {
            let _path = path.join(_moduleDirectory, fn);
            let _logPath = `./${path.join(_moduleLogPath, fn)}`;
            let _module = await import(_path)
                .then(m => m.__command)
                .catch(err => {
                    // Log the error to the console
                    logger.error("::IMPORT_COMMAND", `Failed to import command module at '${_logPath}'`, err);
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
        contextMenu: [] as ImportedCommandModule<"contextMenu">[],
        userInstall: [] as ImportedCommandModule<"userInstall">[]
    };

    // Import the command modules
    let modules = {
        contextMenu: await importCommandModules("contextMenu"),
        userInstall: await importCommandModules("userInstall")
    };

    // Filter the imported interaction command modules ( Context Menu )
    for (let ctx of modules.contextMenu) {
        if (!ctx.module) continue;

        let _filename = ctx.path.split(".").shift();

        if (_filename?.endsWith("_CTX")) {
            importedCommands.contextMenu.push(ctx);
        }
    }

    // Filter the imported interaction command modules ( UserInstall )
    for (let ui of modules.userInstall) {
        if (!ui.module) continue;

        let _filename = ui.path.split(".").shift();

        if (_filename?.endsWith("_UI")) {
            importedCommands.userInstall.push(ui);
        }
    }

    return importedCommands;
}

export default async function (client: Client<true>): Promise<void> {
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

            logger.importer.command(command.module.builder.name, command.path, "SLSH");
        }
    }

    // Add the imported prefix commands to the client
    for (let [k, v] of Object.entries(importedCommands.prefix)) {
        for (let command of v) {
            if (!command.module) continue;
            client.commands.prefix.all.set(command.module.name, command.module);
            client.commands.prefix[k as "public" | "staff" | "custom"].set(command.module.name, command.module);

            logger.importer.command(command.module.name, command.path, "PRFX");

            // Apply aliases
            if (command.module.aliases) {
                for (let alias of command.module.aliases) {
                    client.commands.prefix.all.set(alias, command.module);
                    client.commands.prefix[k as "public" | "staff" | "custom"].set(alias, command.module);

                    logger.importer.command(`${command.module.name} -> @${alias}`, "", "PRFX");
                }
            }
        }
    }

    // Add the imported interaction commands to the client
    for (let [k, v] of Object.entries(importedCommands.interaction)) {
        for (let command of v) {
            if (!command.module) continue;

            client.commands.special.all.set(command.module.builder.name, command.module);
            if (AppCommandManager.isContextMenuCommand(command.module)) {
                client.commands.special.contextMenu.set(command.module.builder.name, command.module);
                logger.importer.command(command.module.builder.name, command.path, "CTX");
            } else if (AppCommandManager.isUserInstallCommand(command.module)) {
                client.commands.special.userInstallable.set(command.module.builder.name, command.module);
                logger.importer.command(command.module.builder.name, command.path, "UI");
            }
        }
    }
}
