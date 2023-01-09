"use client";

import { useStore } from "../../../lib/stores";
import Layout from "../../../ui/Layout";
import Subscriptions from "../../../ui/Subscriptions";

const Page = () => {
  const { user } = useStore();

  return (
    <Layout subscriptions={user ? <Subscriptions user={user} /> : <></>} />
  );
};

export default Page;
