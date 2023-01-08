"use client";

import { useStore } from "../lib/stores";
import Subscriptions from "../ui/Subscriptions";

const Page = () => {
  const { user } = useStore();

  return user ? <Subscriptions user={user} /> : <></>;
};

export default Page;
