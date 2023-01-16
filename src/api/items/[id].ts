import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import database from "../../../lib/database";
import { User } from "../../../lib/types";

export default async function handler(request: Request, response: Response) {
  if (request.method === "GET") {
    try {
      const { id } = request.params;

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
  } else if (request.method === "PUT") {
    const token =
      request.headers.authorization &&
      request.headers.authorization.split("Bearer ")[1];

    try {
      const user: User | null = jwt.verify(
        token as string,
        process.env.JWT_SECRET as string
      ) as User | null;
      if (user) {
        const { id } = request.params;

        const readAt = new Date();

        await database.usersItems.update({
          data: {
            readAt,
          },
          where: {
            userId_itemId: {
              itemId: id as string,
              userId: user.id,
            },
          },
        });

        response.json({ readAt: readAt.getTime() });
      } else {
        response.status(401).json({
          message: "You need to be authentified to read items",
        });
      }
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
