module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction) {
        if (!interaction.isCommand()) return;

        const { commandName, client } = interaction;
        const command = client.commands.get(commandName);

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    },
};
