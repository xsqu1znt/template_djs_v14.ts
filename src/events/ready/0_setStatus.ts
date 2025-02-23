import { DJSClientEvent } from "@customTypes/events";
import { ActivityData, ClientActivity } from "@customTypes/misc";

import { ActivityType } from "discord.js";
import jsTools from "jstools";

import { IN_DEV_MODE } from "@constants";
import config from "@configs";

export const __event: DJSClientEvent<"ready"> = {
    name: __filename.split("/").pop()!.split(".")[0],
    event: "ready",

    execute: async client => {
        let clientActivity: ClientActivity = IN_DEV_MODE
            ? config.client.client_activity.dev
            : config.client.client_activity.default;

        let activityIndex = 0;
        let lastActivity: ActivityData | null = null;

        const parseStatusData = async () => {
            let _data: ActivityData = structuredClone(
                Array.isArray(clientActivity.ACTIVITY)
                    ? clientActivity?.RANDOM_ACTIVITY
                        ? jsTools.choice(clientActivity.ACTIVITY)
                        : clientActivity.ACTIVITY[activityIndex]
                    : clientActivity.ACTIVITY
            );

            // prettier-ignore
            // Replace _data.TYPE with the proper ActivityType enum
            switch (_data.TYPE.toLowerCase()) {
				case "playing": _data.TYPE = ActivityType.Playing; break;
				case "streaming": _data.TYPE = ActivityType.Streaming; break;
				case "listening": _data.TYPE = ActivityType.Listening; break;
				case "watching": _data.TYPE = ActivityType.Watching; break;
				case "custom": _data.TYPE = ActivityType.Custom; break;
				case "competing": _data.TYPE = ActivityType.Competing; break;
            }

            // prettier-ignore
            // Status context formatting
            if (_data.NAME.includes("$")) {
                // Basic context
                _data.NAME = _data.NAME
                    .replace("$USER_COUNT", jsTools.formatThousands(client.users.cache.size))
                    .replace("$GUILD_COUNT", jsTools.formatThousands(client.guilds.cache.size))
                    .replace("$INVITE", config.client.support_server.INVITE_URL);

                // Support server context
                if (_data.NAME.includes("$SUPPORT_SERVER_MEMBER_COUNT")) {
				    await client.guilds.fetch(config.client.support_server.GUILD_ID).then(guild => {
				    	if (!guild) return _data.NAME = _data.NAME.replace("$SUPPORT_SERVER_MEMBER_COUNT", "0");

				    	// Guild member count
				    	_data.NAME = _data.NAME.replace("$SUPPORT_SERVER_MEMBER_COUNT", jsTools.formatThousands(guild.members.cache.size));
				    }).catch(err => console.log("Failed to fetch the support server for client status", err));
			    }
            }

            // Avoid duplicates if RANDOM_ACTIVITY is enabled
            if (clientActivity?.RANDOM_ACTIVITY && lastActivity?.NAME !== _data.NAME) return await parseStatusData();

            // Increment activity index
            if (!clientActivity?.RANDOM_ACTIVITY && Array.isArray(clientActivity.ACTIVITY))
                if (activityIndex < clientActivity.ACTIVITY.length - 1) activityIndex++;
                else activityIndex = 0;

            // Cache the last activity
            lastActivity = _data;

            return _data;
        };

        const setStatus = async () => {
            let _data = await parseStatusData();

            // Set the status
            client.user?.setStatus(_data.STATUS);
            // Set the activity
            client.user?.setActivity({ type: _data.TYPE, name: _data.NAME, url: _data?.STREAM_URL || undefined });

            if (clientActivity?.INTERVAL) {
                // Sleep
                await jsTools.sleep(jsTools.parseTime(clientActivity.INTERVAL));

                // Run it back
                return await setStatus();
            }
        };

        // Set the client's status
        return await setStatus();
    }
};
