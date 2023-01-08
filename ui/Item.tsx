import type { Item } from "@prisma/client";

interface Props {
  item: Item;
}

const Item = ({ item }: Props) => <div>{item.label}</div>;

export default Item;
