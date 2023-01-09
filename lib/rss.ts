import Parser from "rss-parser";
import database from "./database";

const rss = new Parser();

export default rss;

export const refresh = async (url: string) => {
  const rawFeed = await rss.parseURL(url);

  const updateDate = new Date();

  const feed = await database.feed.findUniqueOrThrow({
    where: {
      url: url,
    },
  });

  await database.item.createMany({
    data: rawFeed.items.map((item) => ({
      itemId: item.guid as string,
      label: item.title || "",
      link: item.link,
      description: item.content || item.summary,
      picture: null,
      publishedAt: new Date(item.isoDate as string),
      feedId: feed.id,
    })),
    skipDuplicates: true,
  });

  const users = await database.user.findMany({
    where: {
      subscriptions: {
        some: { feedId: feed.id },
      },
    },
  });

  const items = await database.item.findMany({
    where: {
      createdAt: {
        gte: updateDate,
      },
      feedId: feed.id,
    },
  });

  await database.usersItems.createMany({
    data: users.flatMap((user) =>
      items.map((item) => ({
        itemId: item.id,
        userId: user.id,
      }))
    ),
    skipDuplicates: true,
  });

  await database.feed.update({
    where: {
      id: feed.id,
    },
    data: {
      updatedAt: updateDate,
    },
  });
};
