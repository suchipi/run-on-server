import { oneLine, stripIndent } from "common-tags";
import getCodeFrame from "./getCodeFrame";

export function createClientResultNotSavedToVariable({
  createClientFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      The result of calling ${createClientFunctionName} was not saved to a
      variable.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      Saving the result of ${createClientFunctionName} to a variable
      is the only supported way to use the run-on-server babel plugin.
    ` +
    "\n" +
    stripIndent`
      For example, try:
    ` +
    `\n  const runOnServer = ${createClientFunctionName}("http://somewhere:3000");`
  );
}

export function createClientResultNotSavedAsIdentifier({
  createClientFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      The result of calling ${createClientFunctionName} was saved to a
      variable, but that variable was created in an unexpected way.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      The only variable declaration forms supported by
      the run-on-server babel plugin are:
    ` +
    "\n  " +
    stripIndent`
        const runOnServer = ${createClientFunctionName}("http://somewhere:3000");
      OR
        let runOnServer = ${createClientFunctionName}("http://somewhere:3000");
      OR
        var runOnServer = ${createClientFunctionName}("http://somewhere:3000");
    `
  );
}

export function runOnServerNotCalledDirectly({
  runOnServerFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      ${runOnServerFunctionName} was referenced in a way where it wasn't
      a direct variable call.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      This is not supported- the only form of referencing
      ${runOnServerFunctionName} supported by the run-on-server babel
      plugin is calling it directly, eg:
    ` +
    `\n  ${runOnServerFunctionName}("args", [1, 2, 3]);`
  );
}

export function runOnServerCalledWithoutArguments({
  runOnServerFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      ${runOnServerFunctionName} was called without any arguments.
      This is not a valid use of the run-on-server library, and is
      therefore not understood by the run-on-server babel plugin.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      ${runOnServerFunctionName} expects to be called with a string or
      function as the first argument (the code to be executed), and
      optionally an array as the second argument (the arguments to pass
      to the executed code). For example:
    ` +
    "\n" +
    `  ${runOnServerFunctionName}("console.log('hi')");\n` +
    "OR\n" +
    `  ${runOnServerFunctionName}(() => console.log("hi"));\n` +
    "OR\n" +
    `  ${runOnServerFunctionName}((a, b, c) => a + b + c, [1, 2, 3]);\n` +
    "OR\n" +
    `  ${runOnServerFunctionName}("args[0] + args[1] + args[2]", [1, 2, 3]);\n`
  );
}

export function runOnServerCalledWithInvalidExpression({
  runOnServerFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      The first argument passed to ${runOnServerFunctionName} was
      not a template literal, string literal, arrow function expression,
      function expression, or variable referring to one of those.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      These are the only forms supported by the run-on-server babel plugin.
    `
  );
}

export function runOnServerCalledWithTemplateLiteralWithExpressions({
  runOnServerFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      The first argument passed to ${runOnServerFunctionName} was a
      template literal with embedded expressions. This is not supported
      by the run-on-server babel plugin.
    ` +
    "\n" +
    getCodeFrame(node, state) +
    "\n" +
    oneLine`
      Instead of doing this, use the \`args\` argument within the
      template literal string to reference the optional array that can
      be passed as the second argument to runOnServer:
    ` +
    "\n" +
    `  ${runOnServerFunctionName}("console.log(args)", [1, 2, 3]);\n`
  );
}

export function runOnServerCalledWithNonConstantBinding({
  runOnServerFunctionName,
  node,
  state,
}) {
  return (
    oneLine`
      The first argument passed to ${runOnServerFunctionName} referred
      to a variable whose value changes during the execution of the
      program. This is not supported by the run-on-server babel plugin.
    ` +
    "\n" +
    getCodeFrame(node, state)
  );
}
