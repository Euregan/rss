import type { ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <head />
      <body>
        <nav>
          <ul>
            <li>
              <Link href="/signup">Signup</Link>
            </li>
            <li>
              <Link href="/signin">Signin</Link>
            </li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}