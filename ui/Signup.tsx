"use client";

import { FormEvent, FormEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../lib/stores";
import { useApi } from "../lib/api";

interface Props {
  redirect?: string;
  onSignup?: () => void;
}

const Signup = ({ redirect, onSignup }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useStore();
  const api = useApi();
  const router = useRouter();

  const signup = (event: FormEvent) => {
    event.preventDefault();

    return api
      .post("/api/signup", {
        email,
        password,
      })
      .then(({ token }) => {
        login(token);
        if (onSignup) {
          onSignup();
        }
        if (redirect) {
          router.push(redirect);
        }
      });
  };

  return (
    <form onSubmit={signup}>
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
      <button type="submit">Sign up</button>
    </form>
  );
};

export default Signup;
