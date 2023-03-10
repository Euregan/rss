import type { Request, Response } from "express";
import database from "../../lib/database";
import rss, { refresh } from "../../lib/rss";

export default async function handler(request: Request, response: Response) {
  if (process.env.NODE_ENV !== "development") {
    return response.status(404).end();
  }

  if (request.method === "GET") {
    try {
      const feeds = await database.feed.findMany();

      await Promise.all(feeds.map(({ url }) => refresh(url)));

      response.end();
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
