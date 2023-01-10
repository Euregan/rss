import type { ReactNode } from "react";
import { Open_Sans } from "@next/font/google";
import Nav from "../ui/Nav";
import "./global.css";
import styles from "./layout.module.css";

interface Props {
  children: ReactNode;
}

const fira = Open_Sans({
  weight: ["500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const RootLayout = ({ children }: Props) => {
  return (
    <html className={fira.className}>
      <head />
      <body className={styles.page}>
        <Nav />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
