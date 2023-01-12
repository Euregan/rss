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

  const existingItems = await database.item.findMany({
    where: {
      feedId: feed.id,
      itemId: {
        in: rawFeed.items.map(({ guid }) => guid).filter((x) => x) as string[],
      },
    },
  });

  const itemsToCreate = rawFeed.items.filter(
    (item) => !existingItems.some((existing) => existing.itemId === item.guid)
  );

  if (itemsToCreate.length === 0) {
    return;
  }

  await database.item.createMany({
    data: itemsToCreate.map((item) => ({
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

export const addFeed = async (url: string) => {
  const rawFeed = await rss.parseURL(url);

  const feed = await database.feed.create({
    data: {
      url: url,
      label: rawFeed.title || "", // TODO: Grab the title from the website if there is none in the feed
      link: rawFeed.link,
      picture: null, // TODO: Retrieve the image from the description if there is one
      lastUpdated: new Date(),
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

  if (process.env.CRON_SAAS_URL && process.env.CRON_SAAS_API_KEY) {
    console.log(
      await fetch(process.env.CRON_SAAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SAAS_API_KEY}`,
        },
        body: JSON.stringify({
          url: `${process.env.URL}/api/refresh/${encodeURIComponent(url)}`,
          cron: `${Math.round(Math.random() * 59)} * * * *`,
        }),
      }).then((response) => response.json())
    );
  }

  return await database.feed.findUnique({
    where: {
      id: feed.id,
    },
    include: { items: true },
  });
};
