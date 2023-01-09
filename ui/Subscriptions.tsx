"use client";

import Link from "next/link";
import { Item } from "../lib/types";
import styles from "./Subscriptions.module.css";

interface Props {
  items: Array<Item>;
}

const Subscriptions = ({ items }: Props) => (
  <ul className={styles.subscriptions}>
    {items.map((item) => (
      <li key={item.id}>
        <div>
          <Link href={`/feed/all/${item.id}`}>{item.label}</Link>
          <span>{item.publishedAt}</span>
        </div>
      </li>
    ))}
  </ul>
);

export default Subscriptions;
