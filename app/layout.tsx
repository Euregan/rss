import type { ReactNode } from "react";
import Nav from "../ui/Nav";
import styles from "./layout.module.css";

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return (
    <html>
      <head />
      <body className={styles.page}>
        <Nav />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
