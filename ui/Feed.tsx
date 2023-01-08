import type { Feed, Item } from "@prisma/client";
import ItemDisplay from "./Item";

interface Props {
  feed: Feed & { items: Item[] };
}

const Feed = ({ feed }: Props) => (
  <div>
    {feed.label}
    <ul>
      {feed.items.map((item) => (
        <ItemDisplay key={item.id} item={item} />
      ))}
    </ul>
  </div>
);

export default Feed;
