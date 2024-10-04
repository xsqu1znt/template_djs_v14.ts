import { createInterface } from "node:readline";
import { Client } from "discord.js";
import AppCommandManager from "@utils/AppCommandManager";
import jt from "@utils/jsTools";
import logger from "./logger";

function resolveGuildIds(client: Client, args: string[]) {
    const guildIds = args.slice(1);

    if (!guildIds.length) {
        if (!client.guilds.cache.size) {
            logger.error("[CLI]", "Guild IDs not provided. Usage example: '!push local 123456789 [...ids]'");
            return [];
        }

        guildIds.push(...client.guilds.cache.map(g => g.id));
    }

    return guildIds;
};

export default async function (client: Client, acm: AppCommandManager): Promise<void> {
    const rl = createInterface({
        input: process.stdin as unknown as NodeJS.ReadableStream,
        output: process.stdout as unknown as NodeJS.WritableStream,
        terminal: false
    });

    rl.on("line", async line => {
        const args = jt.forceArray(line.toLowerCase().split(" ")).map(s => s.trim());
        const commandName = args[0];

        if (!commandName || !commandName.startsWith("/")) return;
        args.shift();

        switch (commandName) {
            case "/push":
                switch (args[0]) {
                    case "local":
                        const guildIds = resolveGuildIds(client, args);
                        if (!guildIds.length) return;
                        return await acm.registerToLocal(guildIds);

                    case "global":
                        return await acm.registerToGlobal();
                    default:
                        return;
                }

            case "/remove":
                switch (args[0]) {
                    case "local":
                        const guildIds = resolveGuildIds(client, args);
                        if (!guildIds.length) return;
                        return await acm.removeFromLocal(guildIds);
                    case "global":
                        return await acm.removeFromGlobal();
                    default:
                        return;
                }
        }
    });
}
