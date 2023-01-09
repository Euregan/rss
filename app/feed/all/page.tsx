"use client";

import { useStore } from "../../../lib/stores";
import Layout from "../../../ui/Layout";
import Subscriptions from "../../../ui/Subscriptions";

const Page = () => {
  const { subscriptions } = useStore();

  return (
    <Layout
      subscriptions={
        <Subscriptions items={subscriptions.flatMap(({ items }) => items)} />
      }
    />
  );
};

export default Page;
