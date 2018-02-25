import md5 from "md5";
import getSourceForNode from "./getSourceForNode";

export default function makeIdForNode(node, state) {
  const source = getSourceForNode(node, state);
  return md5(source);
}
