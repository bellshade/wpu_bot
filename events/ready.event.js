const cron = require("node-cron");
module.exports = {
    name: "ready",
    once: false,
    execute(client) {
        console.info(`Logged in as ${client.user.tag}!`);
        console.info("Bot is ready!");
        const prisma = client.prisma;
        const pointAutomation = async () => {
            try {
                const guild = client.guilds.cache.get(process.env.GUILD_ID); // jika bot tidak hanya berada di 1 guild, client.guilds akan memberi data lebih dari 1 data guild
                const ketuaRole = guild.roles.cache.get(process.env.ROLE_KETUA);
                const memberRole = ketuaRole.members.map((member) => member.user);
                for (const member of memberRole) {
                    const lastMsg = await prisma.messages.findMany({
                        where: {
                            author_id: member.id,
                        },
                        orderBy: {
                            author_id: "asc",
                        },
                        take: 1,
                    });
                    let massCreateNew = {
                        ketua_id: member.id,
                        ketua_name: member.username,
                        ketua_point: 1,
                        author_name: client.user.username,
                        author_id: client.user.id,
                    };
                    const date = lastMsg.map((m) => new Date(m.timestamp).getDate());
                    for (const d of date) {
                        const calc = new Date().getDate() - d;
                        if (calc <= 7) {
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
                }
            } catch (error) {
                console.log(error);
            }
        };

        cron.schedule("01 0 * * 1", () => {
            pointAutomation();
        });
    },
};
