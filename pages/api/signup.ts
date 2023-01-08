import type { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import database from "../../lib/database";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
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
      const hashedPassword = await argon2.hash(password);
      const user = await database.user.create({
        data: {
          password: hashedPassword,
          email,
        },
      });

      response.status(200).json({
        token: jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          process.env.JWT_SECRET as string
        ),
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: "Something wrong happened" });
    }
  } else {
    response.status(405).json({ message: "Wrong method" });
  }
}
