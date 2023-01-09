"use client";

import { useStore } from "../../../../lib/stores";
import ItemDisplay from "../../../../ui/Item";
import Layout from "../../../../ui/Layout";
import Subscriptions from "../../../../ui/Subscriptions";

interface Props {
  params: { id: string };
}

const Page = ({ params }: Props) => {
  const id = params.id;
  const { subscriptions } = useStore();

  const items = subscriptions.flatMap(({ items }) => items);
  const item = items.find((item) => item.id === id);

  return (
    <Layout
      subscriptions={<Subscriptions items={items} />}
      item={
        item ? (
          <ItemDisplay item={item} />
        ) : (
          "There was an error loading this item"
        )
      }
    />
  );
};

export default Page;
