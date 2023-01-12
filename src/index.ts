import { Elm } from "./Main.elm";

const stored = JSON.parse(localStorage.getItem("rss") || "{}");

const app = Elm.Main.init({
  node: document.getElementById("root"),
  flags: { jwt: stored.jwt || null },
});

app.ports.feedsUpdated.subscribe((subscriptions: any) => {
  const stored = JSON.parse(localStorage.getItem("rss") || "{}");
  localStorage.setItem("rss", JSON.stringify({ ...stored, subscriptions }));
});
