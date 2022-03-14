const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection } = require('discord.js');
const { PaginatorEvents, ActionRowPaginator } = require('@psibean/discord.js-pagination');

const data = require('../data/sticker.json');
const MAHASISWA_ID = process.env.ROLES_MAHASISWA;

const keys = Object.keys(data);

const constructDataOptions = (data) => {
    return data.map(x => {
        return {
            label: `${keys.indexOf(x) + 1} - ${x}`,
            description: x,
            value: x
        };
    });
};

const getDataList = (limit, initial) => {
    return keys.slice(initial, initial + limit);
};

const basicEndHandler = async ({ reason, paginator }) => {
    // This is a basic handler that will delete the message containing the pagination.
    try {
        console.log(`The pagination has ended: ${reason}`);
        if (paginator.message.deletable) await paginator.message.delete();
    } catch (error) {
        console.log('There was an error when deleting the message: ');
        console.log(error);
    }
};

exports.command = new SlashCommandBuilder()
    .setName('sticker')
    .setDescription('Preview available sticker');

exports.permissions = [
    {
        id: MAHASISWA_ID,
        type: 'ROLE',
        permisssion: true
    }
];

exports.execute = async (interaction) => {
    try {
        await interaction.deferReply();
        return main(interaction);
    } catch (error) {
        console.error(error);
    }
};

exports.selectMenu = async (interaction) => {
    try {
        await interaction.deferUpdate();
        return main(interaction);
    } catch (error) {
        console.error(error);
    }
};

const main = async (interaction) => {
    const SELECT_LIMIT = 25;
    const MAX_DATA = data.length;
    const MAX_SELECTIONS = Math.floor(MAX_DATA / SELECT_LIMIT) + (MAX_DATA % SELECT_LIMIT > 0 ? 1 : 0);
    const messageActionRows = [
        {
            components: [
                {
                    type: 'SELECT_MENU',
                    placeholder: 'Currently viewing #001 - #025',
                },
            ],
        },
        {
            components: [
                {
                    type: 'BUTTON',
                    emoji: '⏪',
                    label: 'start',
                    style: 'SECONDARY',
                },
                {
                    type: 'BUTTON',
                    label: `PREVIOUS`,
                    style: 'PRIMARY',
                },
                {
                    type: 'BUTTON',
                    label: `NEXT`,
                    style: 'PRIMARY',
                },
                {
                    type: 'BUTTON',
                    emoji: '⏩',
                    label: 'end',
                    style: 'SECONDARY',
                },
            ],
        },
    ];

    const dataSelectOptions = new Collection();
    const initialSelectIdentifier = 0;

    const initialData = getDataList(SELECT_LIMIT, initialSelectIdentifier);
    dataSelectOptions.set(initialSelectIdentifier, constructDataOptions(initialData));

    messageActionRows[0].components[0].options = dataSelectOptions.get(initialSelectIdentifier);

    const identifiersResolver = async ({ interaction, paginator }) => {
        if (interaction.componentType === 'BUTTON') {
            let { selectOptionsIdentifier } = paginator.currentIdentifiers;
            switch (interaction.component.label) {
                case 'start':
                    selectOptionsIdentifier = paginator.initialIdentifiers.selectOptionsIdentifier;
                    break;
                case `PREVIOUS`:
                    selectOptionsIdentifier -= 1;
                    break;
                case `NEXT`:
                    selectOptionsIdentifier += 1;
                    break;
                case 'end':
                    selectOptionsIdentifier = MAX_SELECTIONS - 1;
                    break;
            }

            if (selectOptionsIdentifier < 0) {
                selectOptionsIdentifier = MAX_SELECTIONS + selectOptionsIdentifier % MAX_SELECTIONS;
            } else if (selectOptionsIdentifier >= MAX_SELECTIONS) {
                selectOptionsIdentifier %= MAX_SELECTIONS;
            }

            if (!dataSelectOptions.has(selectOptionsIdentifier)) {
                const limit = selectOptionsIdentifier === MAX_SELECTIONS - 1 ? 1 : SELECT_LIMIT;
                const dataSelect = getDataList(limit, selectOptionsIdentifier * SELECT_LIMIT);
                dataSelectOptions.set(selectOptionsIdentifier, constructDataOptions(dataSelect));
            }

            return {
                ...paginator.currentIdentifiers,
                selectOptionsIdentifier,
            };
        } else if (interaction.componentType === 'SELECT_MENU') {
            return {
                ...paginator.currentIdentifiers,
                pageIdentifier: interaction.values[0],
            };
        }

        return null;
    };

    const pageEmbedResolver = async ({ newIdentifiers, currentIdentifiers, paginator }) => {
        const { pageIdentifier: newPageIdentifier } = newIdentifiers;
        const { pageIdentifier: currentPageIdentifier } = currentIdentifiers;

        if (newPageIdentifier !== currentPageIdentifier) {
            const sticker = data[newPageIdentifier];
            const newEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Sticker preview \`${newPageIdentifier}\``)
                .setURL(sticker)
                .setImage(sticker)
                .setTimestamp();

            return newEmbed;
        }

        return paginator.currentPage;
    };

    const handleBeforePageChanged = ({ newIdentifiers, currentIdentifiers, paginator }) => {
        const { selectOptionsIdentifier: currentSelectOptionsIdentifier } = currentIdentifiers;
        const { selectOptionsIdentifier: newSelectOptionsIdentifier } = newIdentifiers;

        if (currentSelectOptionsIdentifier !== newSelectOptionsIdentifier) {
            paginator.getComponent(0, 0).options = dataSelectOptions.get(newSelectOptionsIdentifier);
            if (newSelectOptionsIdentifier === MAX_SELECTIONS - 1) {
                paginator.getComponent(0, 0).placeholder = `Currently viewing #${MAX_DATA} - #${MAX_DATA}`;
            } else {
                paginator.getComponent(0, 0).placeholder = `Currently viewing #${`${newSelectOptionsIdentifier * SELECT_LIMIT + 1}`.padStart(3, '0')} - #${`${newSelectOptionsIdentifier * SELECT_LIMIT + SELECT_LIMIT}`.padStart(3, '0')}`;
            }
        }
    };

    const shouldChangePage = ({ newIdentifiers, currentIdentifiers }) => {
        const { pageIdentifier: newPageIdentifier, selectOptionsIdentifier: newSelectOptionsIdentifier } = newIdentifiers;
        const { pageIdentifier: currentPageIdentifier, selectOptionsIdentifier: currentSelectOptionsIdentifier } = currentIdentifiers;

        return (
            newPageIdentifier !== currentPageIdentifier || newSelectOptionsIdentifier !== currentSelectOptionsIdentifier
        );
    };

    const endHandler = ({ reason, paginator }) => {
        basicEndHandler({ reason, paginator });
        dataSelectOptions.clear();
    };

    const actionRowPaginator = new ActionRowPaginator(interaction, {
        useCache: false,
        messageActionRows,
        initialIdentifiers: {
            pageIdentifier: 'sticker',
            selectOptionsIdentifier: initialSelectIdentifier,
        },
        identifiersResolver,
        pageEmbedResolver,
        shouldChangePage,
    })
        .on(PaginatorEvents.COLLECT_ERROR, ({error}) => error)
        .on(PaginatorEvents.BEFORE_PAGE_CHANGED, handleBeforePageChanged)
        .on(PaginatorEvents.PAGINATION_END, endHandler);

    await actionRowPaginator.send();
    return actionRowPaginator.message;
};