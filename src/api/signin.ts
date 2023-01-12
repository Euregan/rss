import type { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import database from "../../lib/database";

export default async function handler(request: Request, response: Response) {
  if (request.method === "POST") {
    const { email, password } = request.body;

    if (!email) {
      return response
        .status(400)
        .json({ message: "You need to fill in your email" });
    }
    if (!password) {
      return response
        .status(400)
        .json({ message: "You need to fill in a password" });
    }

    try {
      const user = await database.user.findUnique({
        where: {
          email,
        },
      });

      if (user) {
        const matches = await argon2.verify(user.password, password);

        if (matches) {
          response.status(200).json({
            token: jwt.sign(
              {
                id: user.id,
                email: user.email,
              },
              process.env.JWT_SECRET as string
            ),
          });
        } else {
          response.status(401).json({
            message: "Either the email or the password is invalid",
          });
        }
      } else {
        response.status(401).json({
          message: "Either the email or the password is invalid",
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
