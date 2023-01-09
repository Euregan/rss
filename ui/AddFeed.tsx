"use client";

import { FormEvent, useEffect, useState } from "react";
import { useApi } from "../lib/api";
import { Subscription } from "../lib/types";
import FeedDisplay from "./Feed";

const AddFeed = () => {
  const [url, setUrl] = useState("");
  const [feed, setFeed] = useState<Subscription | null>(null);
  const api = useApi();

  useEffect(() => {
    if (url) {
      api
        .get<Subscription>(`/api/feeds/${encodeURIComponent(url)}`)
        .then(setFeed);
    }
  }, [url]);

  const subscribe = (event: FormEvent) => {
    event.preventDefault();

    if (url) {
      api.post("/api/subscriptions", {
        url,
      });
    }
  };

  return (
    <>
      <form onSubmit={subscribe}>
        <label>
          Feed URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} />
        </label>
        <button type="submit">Subscribe</button>
      </form>
      {feed && <FeedDisplay feed={feed} />}
    </>
  );
};

export default AddFeed;
