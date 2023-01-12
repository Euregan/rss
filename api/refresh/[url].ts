import type { Request, Response } from "express";
import rss, { refresh } from "../../lib/rss";

export default async function handler(request: Request, response: Response) {
  if (request.method === "GET") {
    try {
      const { url } = request.query;

      refresh(decodeURIComponent(url as string));

      response.end();
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
