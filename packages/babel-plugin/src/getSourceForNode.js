import { lineColumnToIndex } from "line-and-column-to-string-index";

export default function getSourceForNode(node, state) {
  const source = state.file.code;
  const { start, end } = node.loc;

  const startIndex = lineColumnToIndex(source, start.line - 1, start.column);
  const endIndex = lineColumnToIndex(source, end.line - 1, end.column)

  return source.slice(startIndex, endIndex);
}
