import type { NextApiRequest, NextApiResponse } from "next";
import database from "../../lib/database";
import rss, { addFeed } from "../../lib/rss";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    try {
      const { url } = request.query;
      const parsedUrl = decodeURIComponent(url as string);

      let feed = await database.feed.findUnique({
        where: {
          url: parsedUrl,
        },
        include: { items: true },
      });

      response.json(feed || (await addFeed(parsedUrl)));
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
