"use client";

import type { Item } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "../lib/api";
import { User } from "../lib/types";

interface Props {
  user: User;
}

const Subscriptions = ({ user }: Props) => {
  const [items, setItems] = useState<Item[] | null>(null);
  const api = useApi();
  const router = useRouter();

  useEffect(() => {
    api
      .get<Item[]>("/api/subscriptions")
      .then((items) =>
        items.map((item) => ({
          ...item,
          publishedAt: new Date(item.publishedAt),
        }))
      )
      .then(setItems);
  }, []);

  return items === null ? (
    <>Loading</>
  ) : (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <Link href={`/feed/all/${item.id}`}>{item.label}</Link>
            <span>{item.publishedAt.toDateString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Subscriptions;
