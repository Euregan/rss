"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../lib/stores";
import { useApi } from "../lib/api";

interface Props {
  redirect?: string;
  onSignin?: () => void;
}

const Signin = ({ redirect, onSignin }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useStore();
  const api = useApi();
  const router = useRouter();

  const signin = (event: FormEvent) => {
    event.preventDefault();

    return api
      .post<{ token: string }>("/api/signin", {
        email,
        password,
      })
      .then(({ token }) => {
        login(token);
        if (onSignin) {
          onSignin();
        }
        if (redirect) {
          router.push(redirect);
        }
      });
  };

  return (
    <form onSubmit={signin}>
      <label>
        Email
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
};

export default Signin;
