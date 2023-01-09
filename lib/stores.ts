import type { Subscriptions, User } from "./types";
import create from "zustand";
import { persist } from "zustand/middleware";
import jwt from "jsonwebtoken";
import { api } from "./api";

interface UserState {
  user: User | null;
  jwt: string | null;
  login: (token: string) => void;
  logout: () => void;
  subscriptions: Subscriptions;
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

        api<Subscriptions>("/api/feeds", "GET", token).then((subscriptions) =>
          set({ subscriptions })
        );
      },
      logout: () => set({ jwt: null, user: null }),
      subscriptions: [],
      subscriptionsLoading: true,
    }),
    {
      name: "rss",
      onRehydrateStorage: () => (state) => {
        if (state?.jwt) {
          state.login(state.jwt);
        }
      },
    }
  )
);

// Synchronizing the store across tabs
window.addEventListener("storage", (e: StorageEvent) => {
  if (e.key === useStore.persist.getOptions().name && e.newValue) {
    useStore.persist.rehydrate();
  }
});
