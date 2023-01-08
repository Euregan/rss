import type { NextApiRequest, NextApiResponse } from "next";
import database from "../../../lib/database";
import rss from "../../../lib/rss";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    try {
      const { url } = request.query;
      const parsedUrl = decodeURIComponent(url as string);

      const rawFeed = await rss.parseURL(parsedUrl);

      const updateDate = new Date();

      const feed = await database.feed.findUniqueOrThrow({
        where: {
          url: parsedUrl,
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

      response.end();
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
