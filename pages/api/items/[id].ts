import type { NextApiRequest, NextApiResponse } from "next";
import database from "../../../lib/database";
import rss from "../../../lib/rss";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    try {
      const { id } = request.query;

      const item = await database.item.findUnique({
        where: {
          id: id as string,
        },
      });

      response.json(item);
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
