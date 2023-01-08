"use client";

import type { Item } from "@prisma/client";
import { useEffect, useState } from "react";
import { useApi } from "../lib/api";
import { User } from "../lib/types";

interface Props {
  user: User;
}

const Subscriptions = ({ user }: Props) => {
  const [items, setItems] = useState<Item[] | null>(null);
  const api = useApi();

  useEffect(() => {
    api.get<Item[]>("/api/subscriptions").then(setItems);
  }, []);

  return items === null ? (
    <>Loading</>
  ) : (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
};

export default Subscriptions;
