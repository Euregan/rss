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

      const feed = await database.feed.upsert({
        create: {
          url: parsedUrl,
          label: rawFeed.title || "", // TODO: Grab the title from the website if there is none in the feed
          link: rawFeed.link,
          picture: null, // TODO: Retrieve the image from the description if there is one
          lastUpdated: new Date(),
        },
        update: {
          label: rawFeed.title || "", // TODO: Grab the title from the website if there is none in the feed
          link: rawFeed.link,
          picture: null, // TODO: Retrieve the image from the description if there is one
          lastUpdated: new Date(),
        },
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

      response.json(
        await database.feed.findUnique({
          where: {
            id: feed.id,
          },
          include: { items: true },
        })
      );
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
