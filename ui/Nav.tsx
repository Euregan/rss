"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "../lib/stores";
import styles from "./Nav.module.css";

const Nav = () => {
  const { user, subscriptions, logout } = useStore();
  const pathname = window.location.pathname;

  return (
    <nav className={styles.nav}>
      <ul className={styles.menu}>
        <li className={styles.inbox}>
          <div
            className={
              pathname.startsWith("/feed/all") ? styles.active : styles.item
            }
          >
            Inbox
            <span>
              {subscriptions.reduce(
                (total, feed) => total + feed.items.length,
                0
              )}
            </span>
          </div>
          <ul className={styles.subscriptions}>
            {subscriptions.map((feed) => (
              <li key={feed.id} className={styles.item}>
                {feed.label}
                <span>{feed.items.length}</span>
              </li>
            ))}
          </ul>
        </li>
      </ul>
      <ul className={styles.menu}>
        {user ? (
          <>
            <li className={styles.item}>Settings</li>
            <li onClick={logout} className={styles.item}>
              Sign out
            </li>
          </>
        ) : (
          <>
            <li className={styles.item}>
              <Link href="/signup">Signup</Link>
            </li>
            <li className={styles.item}>
              <Link href="/signin">Signin</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
