"use client";

import { Item } from "@prisma/client";
import { useEffect, useState } from "react";
import { useApi } from "../../../../lib/api";
import { useStore } from "../../../../lib/stores";
import ItemDisplay from "../../../../ui/Item";
import Layout from "../../../../ui/Layout";
import Subscriptions from "../../../../ui/Subscriptions";

interface Props {
  params: { id: string };
}

const Page = ({ params }: Props) => {
  const [item, setItem] = useState<Item | null>(null);
  const id = params.id;
  const api = useApi();
  const { user } = useStore();

  useEffect(() => {
    api
      .get<Item>(`/api/items/${encodeURIComponent(id)}`)
      .then((item) => ({ ...item, publishedAt: new Date(item.publishedAt) }))
      .then(setItem);
  }, [id]);

  return (
    <Layout
      subscriptions={user ? <Subscriptions user={user} /> : <></>}
      item={item ? <ItemDisplay item={item} /> : <>Loading</>}
    />
  );
};

export default Page;
