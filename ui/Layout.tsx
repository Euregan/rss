import { ReactNode } from "react";
import styles from "./Layout.module.css";

interface Props {
  subscriptions?: ReactNode;
  item?: ReactNode;
}

const Layout = ({ subscriptions, item }: Props) => (
  <div className={styles.layout}>
    {subscriptions}
    {subscriptions ? item || "Select an item on the left" : <></>}
  </div>
);

export default Layout;
