import type { ReactNode } from "react";
import Nav from "../ui/Nav";

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return (
    <html>
      <head />
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
