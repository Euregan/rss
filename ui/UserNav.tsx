"use client";

import Link from "next/link";
import { useStore } from "../lib/stores";

const UserNav = () => {
  const { user } = useStore();

  return user ? (
    <></>
  ) : (
    <>
      <li>
        <Link href="/signup">Signup</Link>
      </li>
      <li>
        <Link href="/signin">Signin</Link>
      </li>
    </>
  );
};

export default UserNav;
