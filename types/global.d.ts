import { Client, Collection } from "discord.js";

declare module "discord.js" {
    interface Client {
        slashCommands: {
            all: Collection<K, V>;
            public: Collection<K, V>;
            staff: Collection<K, V>;
            userInstall: Collection<K, V>;
            custom: Collection<K, V>;
        };

        prefixCommands: {
            all: Collection<K, V>;
            public: Collection<K, V>;
            staff: Collection<K, V>;
            custom: Collection<K, V>;
        };
    }
}
