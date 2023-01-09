import type { User } from "./types";
import create from "zustand";
import { persist } from "zustand/middleware";
import jwt from "jsonwebtoken";
import { Feed, Item } from "@prisma/client";
import { api } from "./api";

interface UserState {
  user: User | null;
  jwt: string | null;
  login: (token: string) => void;
  logout: () => void;
  subscriptions: Array<Feed & { items: Item[] }>;
  subscriptionsLoading: boolean;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      login: (token) => {
        set({
          jwt: token,
          user: jwt.decode(token) as User,
        });

        api<Array<Feed & { items: Item[] }>>("/api/feeds", "GET", token).then(
          (subscriptions) => set({ subscriptions })
        );
      },
      logout: () => set({ jwt: null, user: null }),
      subscriptions: [],
      subscriptionsLoading: true,
    }),
    {
      name: "rss",
      onRehydrateStorage(state) {
        return (state) => {
          if (state?.jwt) {
            state.login(state.jwt);
          }
        };
      },
    }
  )
);
