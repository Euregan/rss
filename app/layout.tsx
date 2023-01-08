import type { ReactNode } from "react";
import UserNav from "../ui/UserNav";

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return (
    <html>
      <head />
      <body>
        <nav>
          <ul>
            <UserNav />
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
