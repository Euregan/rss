import type { Item } from "@prisma/client";
import styles from "./Item.module.css";

interface Props {
  item: Item;
}

const Item = ({ item }: Props) => (
  <div className={styles.item}>
    <div className={styles.header}>
      <h3 className={styles.label}>
        <a href={item.link || ""} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      </h3>
      <span className={styles.date}></span>
      {item.description && (
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
      )}
    </div>
  </div>
);

export default Item;
