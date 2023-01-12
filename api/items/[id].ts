import type { Request, Response } from "express";
import database from "../../lib/database";

export default async function handler(request: Request, response: Response) {
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
