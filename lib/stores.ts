import type { User } from "./types";
import create from "zustand";
import { persist } from "zustand/middleware";
import jwt from "jsonwebtoken";

interface UserState {
  user: User | null;
  jwt: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      login: (token) => set({ jwt: token, user: jwt.decode(token) as User }),
      logout: () => set({ jwt: null, user: null }),
    }),
    {
      name: "rss",
    }
  )
);
