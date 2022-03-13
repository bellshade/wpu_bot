module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction) {
        try {
            const { commandName, customId, client } = interaction;

            if (interaction.isCommand()) {
                const command = client.commands.get(commandName);
                command.execute(interaction);
            }

            if (interaction.isSelectMenu()) {
                const command = client.commands.get(customId);
                command.selectMenu(interaction);
            }
        } catch (error) {
            console.error(error);
        }
    },
};
