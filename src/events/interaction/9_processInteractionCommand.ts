import { InteractionEventModule } from "@customTypes/events";

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    Events,
    GuildMember,
    MessageActionRowComponentBuilder,
    PermissionResolvable
} from "discord.js";
import { BetterEmbed } from "@utils/discordTools";
import logger from "@utils/logger";

import config from "@configs";

function getStaffGuildAdminBypass(commandName: string): string[] {
    let _staff = config.client.staff;

    let result: string[] = [];
    let bypass = _staff.BYPASSED.find(b => b.COMMAND_NAME === commandName);

    if (_staff.IGNORES_GUILD_ADMIN.AllStaff) return [_staff.OWNER_ID, ..._staff.MEMBERS, ...(bypass ? bypass.USER_IDS : [])];
    if (_staff.IGNORES_GUILD_ADMIN.Owner) result.push(_staff.OWNER_ID);
    if (_staff.IGNORES_GUILD_ADMIN.Members) result.push(..._staff.MEMBERS);
    if (_staff.IGNORES_GUILD_ADMIN.Bypassed) result.push(...(bypass ? bypass.USER_IDS : []));

    return result;
}

function userIsStaffOrBypassable(interaction: CommandInteraction): boolean {
    let _staff = config.client.staff;
    let bypass = _staff.BYPASSED.find(b => b.COMMAND_NAME === interaction.commandName);
    return [_staff.OWNER_ID, ..._staff.MEMBERS, ...(bypass ? bypass.USER_IDS : [])].includes(interaction.user.id);
}

function userHasGuildAdminOrBypassable(interaction: CommandInteraction<"cached">): boolean {
    let hasAdmin = interaction.memberPermissions.has("Administrator");
    let canBypass = getStaffGuildAdminBypass(interaction.commandName).includes(interaction.user.id);
    return hasAdmin || canBypass;
}

function hasRequiredPermissions(member: GuildMember, required: PermissionResolvable[]) {
    let has: PermissionResolvable[] = [];
    let missing: string[] = [];

    for (let perm of required) {
        if (member.permissions.has(perm)) has.push(perm);
        else missing.push(perm.toString());
    }

    return { has, missing, passed: has.length === required.length };
}

export default {
    name: "processInteractionCommand",
    eventType: Events.InteractionCreate,

    execute: async (client, interaction) => {
        if (!interaction.isCommand() || !interaction.isContextMenuCommand()) return;

        // Get the command from the client, if it exists
        let interactionCommand =
            client.commands.slash.all.get(interaction.commandName) ||
            client.commands.interaction.all.get(interaction.commandName);

        // Command doesn't exist
        if (!interactionCommand) {
            return await interaction
                .reply({ content: `**/\`${interaction.commandName}\`** is not a command.`, ephemeral: true })
                .catch(err => logger.error("$_TIMESTAMP $_COMMAND", `'/${interaction.commandName}' is not a command.`, err));
        }

        // Check if the command is guild only, and if the interaction was not used in a guild
        if (interactionCommand.options?.guildOnly === false && !interaction.inGuild()) {
            return await interaction
                .reply({ content: "This command can only be used inside of a server.", ephemeral: true })
                .catch(() => null);
        }

        /* - - - - - { Parse Command Options } - - - - - */
        if (interactionCommand.options) {
            let _botStaffOnly = interactionCommand.options.botStaffOnly;
            let _guildAdminOnly = interactionCommand.options.guildAdminOnly;

            let _requiredUserPerms = interactionCommand.options.requiredUserPerms;
            let _requiredClientPerms = interactionCommand.options.requiredClientPerms;

            // @config.client.staff
            // Check if the command requires the user to be part of the bot's admin team
            if (_botStaffOnly && !userIsStaffOrBypassable(interaction)) {
                return await new BetterEmbed({
                    color: "Orange",
                    title: "⚠️ Staff Only",
                    description: `Only the developers of ${client.user} can use this command.`
                }).send(interaction, { ephemeral: true, fetchReply: false });
            }

            /* NOTE: The following options require the command to have been used in a cached guild */
            if (interaction.inCachedGuild()) {
                // Check if the command requires the user to have admin permission in the current guild
                if (_guildAdminOnly && !userHasGuildAdminOrBypassable(interaction)) {
                    return await new BetterEmbed({
                        color: "Orange",
                        title: "⚠️ Server Admin Only",
                        description: "You must be an admin of this server to use this command."
                    }).send(interaction, { ephemeral: true, fetchReply: false });
                }

                // Check if the user has the required permissions in the current guild
                if (_requiredUserPerms) {
                    let _permCheck = hasRequiredPermissions(interaction.member, _requiredUserPerms);

                    if (!_permCheck.passed) {
                        return await new BetterEmbed({
                            color: "Orange",
                            title: "⚠️ Missing Permissions",
                            description: `You must have the following permissions:\n${_permCheck.missing.join(", ")}`
                        }).send(interaction, { ephemeral: true, fetchReply: false });
                    }
                }

                // Check if the client has the required permissions in the current guild
                if (_requiredClientPerms && interaction.guild.members.me) {
                    let _permCheck = hasRequiredPermissions(interaction.guild.members.me, _requiredClientPerms);

                    if (!_permCheck.passed) {
                        return await new BetterEmbed({
                            color: "Orange",
                            title: "⚠️ Missing Permissions",
                            description: `I need the following permissions:\n${_permCheck.missing.join(", ")}`
                        }).send(interaction, { ephemeral: true, fetchReply: false });
                    }
                }
            } else {
                // Fallback since we can't check guild dependent options if the command wasn't used in a guild
                if (_guildAdminOnly || _requiredUserPerms || _requiredClientPerms) {
                    return await interaction
                        .reply({
                            content: "This command uses options that require the command to be used in a server.",
                            ephemeral: true
                        })
                        .catch(() => null);
                }
            }

            // Defer the interaction
            if (interactionCommand.options.deferReply) {
                await interaction.deferReply().catch(() => null);
            } else if (interactionCommand.options.deferReplyEphemeral) {
                await interaction.deferReply({ ephemeral: true }).catch(() => null);
            }
        }

        /* - - - - - { Execute the Command } - - - - - */
        try {
            return await interactionCommand.execute(client, interaction).then(async message => {
                /* TODO: run code here after the command finished executing... */
            });
        } catch (err) {
            let _configSupport = config.client.support_server;

            /* NOTE: Invites the user to the support server */
            let aR_supportServer: ActionRowBuilder | undefined;
            let _inviteToSupportServer =
                _configSupport.INVITE_ON_COMMAND_ERROR &&
                _configSupport.INVITE_URL !== "" &&
                interaction.guildId !== _configSupport.GUILD_ID;

            if (_inviteToSupportServer) {
                // Create button ( Support Server Invite )
                let btn_serverInvite = new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(_configSupport.INVITE_URL)
                    .setLabel("Support Server");

                // Create action row ( Support Server Invite )
                aR_supportServer = new ActionRowBuilder().setComponents(btn_serverInvite) as ActionRowBuilder;
            }

            // Create the embed ( Execute Error )
            let embed_executeError = new BetterEmbed({
                color: "Red",
                title: "⛔ Error",
                description: `An error occurred while using **/\`${interaction.commandName}\`**.`
            });

            // Let the user know an error occurred
            embed_executeError.send(interaction, {
                components: aR_supportServer as ActionRowBuilder<MessageActionRowComponentBuilder>,
                ephemeral: true,
                fetchReply: false
            });

            // prettier-ignore
            // Log the error to the console
            return logger.error(
                `$_TIMESTAMP $_COMMAND`,
                `name: /${interaction.commandName} | guild: '${interaction.guildId || "n/a"}' | user: '${interaction.user.id}'`,
                err
            );
        }
    }
} as InteractionEventModule;
