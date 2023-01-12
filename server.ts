import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import type { Request, Response } from "express";

type Handler = (request: Request, response: Response) => Promise<void>;

const buildTree = async (path: string): Promise<Array<[string, Handler]>> =>
  Promise.all(
    fs
      .readdirSync(path)
      .map(async (file): Promise<Array<[string, Handler]>> => {
        const filepath = `${path}/${file}`;
        if (fs.lstatSync(filepath).isDirectory()) {
          return buildTree(filepath);
        } else {
          return [
            [
              filepath
                .replace(/^\.\/src/, "")
                .replace(/\.ts$/, "")
                .replace(/\[/, ":")
                .replace(/\]/, ""),
              (await import(filepath)).default,
            ],
          ];
        }
      })
  ).then((x) => x.flatMap((x) => x));

buildTree("./src/api").then((api) => {
  const app = express();
  const port = 3000;

  app.use(bodyParser.json());

  api.forEach(([route, handler]) => app.all(route, handler));

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log("API:");
    api.forEach(([route]) => console.log(`  ${route}`));
  });
});
