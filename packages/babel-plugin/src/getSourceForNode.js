import TextBuffer from "text-buffer";

export default function getSourceForNode(node, state) {
  const { start, end } = node.loc;
  const range = new TextBuffer.Range(
    [start.line - 1, start.column],
    [end.line - 1, end.column]
  );
  const source = state.file.code;
  return new TextBuffer(source).getTextInRange(range);
}