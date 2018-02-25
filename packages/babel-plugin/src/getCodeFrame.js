import codeFrame from "babel-code-frame";

export default function getCodeFrame(node, state) {
  return codeFrame(
    state.file.code,
    node.loc.start.line,
    node.loc.start.column,
    {
      highlightCode: true,
    }
  );
}
