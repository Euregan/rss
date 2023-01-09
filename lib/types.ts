import { Feed as PrismaFeed, Item as PrismaItem } from "@prisma/client";

export type User = {
  id: string;
  email: string;
};

export type Subscriptions = Array<Subscription>;

export type Subscription = PrismaFeed & { items: Array<Item> };

export type Item = Omit<PrismaItem, "publishedAt"> & { publishedAt: string };
