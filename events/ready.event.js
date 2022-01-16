const cron = require('node-cron');
module.exports = {
    name: 'ready',
    once: false,
    execute(client) {
        console.info(`Logged in as ${client.user.tag}!`);
        console.info('Bot is ready!');

        const prisma = client.prisma;
        const pointAutomation = async () => {
            try {
                const guild = client.guilds.cache.get(process.env.GUILD_ID); // jika bot tidak hanya berada di 1 guild, client.guilds akan memberi data lebih dari 1 data guild
                const ketuaRole = guild.roles.cache.get(process.env.ROLE_KETUA);
                const memberRole = ketuaRole.members.map((member) => member.user);
                const dateInt = new Date().setDate(new Date().getDate() - 7);
                for (const member of memberRole) {

                    // Ambil hasil pertama yang sesuai kriteria
                    const lastMsg = await prisma.messages.findFirst({
                        where: {
                            author_id: member.id, // id member
                            timestamp: {
                                gte: new Date(dateInt),
                                lt: new Date(),
                            },
                        },
                        orderBy: {
                            timestamp: 'desc', // mengurutkan waktu agar yang terahkir muncul paling pertama
                        },
                    });

                    let massCreateNew = {
                        ketua_id: member.id,
                        ketua_name: member.username,
                        ketua_point: 1,
                        author_name: client.user.username,
                        author_id: client.user.id,
                    };
                    if (lastMsg) {
                        await prisma.point.upsert({
                            where: {
                                ketua_id: member.id,
                            },
                            update: {
                                ketua_point: { increment: 1 },
                                author_name: client.user.username,
                                author_id: client.user.id,
                            },
                            create: massCreateNew,
                        });
                    } else {
                        await prisma.point.upsert({
                            where: {
                                ketua_id: member.id,
                            },
                            update: {
                                ketua_point: { decrement: 1 },
                                author_name: client.user.username,
                                author_id: client.user.id,
                            },
                            create: massCreateNew,
                        });
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        cron.schedule('01 0 * * 1', () => {
            pointAutomation();
        });
    },
};
