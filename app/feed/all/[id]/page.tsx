"use client";

import { Item } from "@prisma/client";
import { useEffect, useState } from "react";
import { useApi } from "../../../../lib/api";
import ItemDisplay from "../../../../ui/Item";

interface Props {
  params: { id: string };
}

const Page = ({ params }: Props) => {
  const [item, setItem] = useState<Item | null>(null);
  const id = params.id;
  const api = useApi();

  useEffect(() => {
    api
      .get<Item>(`/api/items/${encodeURIComponent(id)}`)
      .then((item) => ({ ...item, publishedAt: new Date(item.publishedAt) }))
      .then(setItem);
  }, [id]);

  return item ? <ItemDisplay item={item} /> : <>Loading</>;
};

export default Page;
