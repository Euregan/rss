import { Subscription } from "../lib/types";
import ItemDisplay from "./Item";

interface Props {
  feed: Subscription;
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
