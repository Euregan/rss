"use client";

import Link from "next/link";
import { useStore } from "../lib/stores";
import styles from "./Nav.module.css";

const Nav = () => {
  const { user, subscriptions } = useStore();

  return (
    <nav>
      <ul className={styles.menu}>
        <li>
          Your feeds
          <ul className={styles.subscriptions}>
            {subscriptions.map((feed) => (
              <li key={feed.id}>{feed.label}</li>
            ))}
          </ul>
        </li>
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
