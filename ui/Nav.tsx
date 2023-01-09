"use client";

import Link from "next/link";
import { useStore } from "../lib/stores";

const Nav = () => {
  const { user, subscriptions } = useStore();

  return (
    <nav>
      <ul>
        {subscriptions.map((feed) => (
          <li key={feed.id}>{feed.label}</li>
        ))}
        {!user && (
          <>
            <li>
              <Link href="/signup">Signup</Link>
            </li>
            <li>
              <Link href="/signin">Signin</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
