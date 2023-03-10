import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import database from "../../lib/database";
import { User } from "../../lib/types";

export default async function handler(request: Request, response: Response) {
  const token =
    request.headers.authorization &&
    request.headers.authorization.split("Bearer ")[1];

  try {
    const user: User | null = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as User | null;

    if (user) {
      if (request.method === "POST") {
        const { url } = request.body;

        if (!url) {
          return response
            .status(400)
            .json({ message: "You need to specify a URL" });
        }

        try {
          await database.usersFeeds.create({
            data: {
              feed: {
                connect: {
                  url,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          return response.json({});
        } catch (error) {
          console.error(error);
          response.status(500).json({ message: "Something wrong happened" });
        }
      } else if (request.method === "GET") {
        const items = await database.item.findMany({
          where: {
            subscriptions: {
              some: {
                AND: {
                  readAt: null,
                  userId: user.id,
                },
              },
            },
          },
        });

        return response.json(items);
      } else {
        response.status(405).json({ message: "Wrong method" });
      }
    } else {
      response.status(401).json({
        message: "You need to be authentified to subscribe to a feed",
      });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Something wrong happened" });
  }
}
