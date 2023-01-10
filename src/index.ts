import { Elm } from "./Main.elm";

const jwt = JSON.parse(localStorage.getItem("rss") || "{}").jwt || null;

Elm.Main.init({
  node: document.getElementById("root"),
  flags: { jwt },
});
