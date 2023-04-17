declare global {
  interface command {
    name: string;
    description: string;
    permissionRequirements: string[];
    slashBuilder: import("discord.js").RESTPostAPIApplicationCommandsJSONBody;
    execute(
      interaction: import("discord.js").ChatInputCommandInteraction
    ): Promise<void>;
  }
}
export { __global__ as global };
