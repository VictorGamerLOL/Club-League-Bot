const {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} = require("discord.js");

declare global {
  interface command {
    name: string;
    description: string;
    permissionRequirements: string[];
    slashBuilder: RESTPostAPIApplicationCommandsJSONBody;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
  }
}
