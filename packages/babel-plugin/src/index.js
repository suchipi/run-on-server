import path from "path";
import fs from "fs";
import * as t from "babel-types";
import importsVisitor from "imports-visitor";
import * as errorMessages from "./errorMessages";
import makeIdForNode from "./makeIdForNode";
import buildIdMappingsFile from "./buildIdMappingsFile";

module.exports = function() {
  return {
    visitor: {
      Program(programPath, state) {
        const outputPath =
          (this.opts && this.opts.outputPath) ||
          path.join(process.cwd(), "run-on-server-id-mappings.js");

        const imports = [];
        programPath.traverse(importsVisitor, { imports });
        imports.forEach((importDef) => {
          if (importDef.source !== "run-on-server/client") {
            return;
          }

          handleClientImport(importDef, outputPath, state);
        });
      },
    },
  };
};

function handleClientImport(importDef, outputPath, state) {
  const mappings = {};

  const binding = importDef.path.findParent((parent) => parent.isStatement())
    .scope.bindings[importDef.variableName];
  const references = binding.referencePaths;

  // `references` are references to createClient, not runOnServer. We need
  // to find references to runOnServer.
  references.forEach((createClientReference) => {
    let createClientFunctionName = "createClient";
    if (createClientReference.isIdentifier()) {
      createClientFunctionName = createClientReference.node.name;
    }

    let runOnServerFunctionName = "runOnServer";

    function makeError(messageFunc, node) {
      return new Error(
        messageFunc({
          createClientFunctionName,
          runOnServerFunctionName,
          node,
          state,
        })
      );
    }

    // createClient Identifier -> CallExpression -> VariableDeclarator
    const declarator = createClientReference.parentPath.parentPath;
    if (!declarator.isVariableDeclarator()) {
      throw makeError(
        errorMessages.createClientResultNotSavedToVariable,
        createClientReference.node
      );
    }

    const id = declarator.get("id");
    if (!id.isIdentifier()) {
      throw makeError(
        errorMessages.createClientResultNotSavedAsIdentifier,
        id.node
      );
    }

    const bindings = id.scope.bindings[id.node.name];
    if (bindings == null) {
      // They made a runOnServer function but aren't using it anywhere yet.
      return;
    }

    const runOnServerPaths = bindings.referencePaths;
    runOnServerFunctionName = id.node.name;
    runOnServerPaths.forEach((referencePath) => {
      // Handle module.exports = runOnServer, { foo: runOnServer }, etc.
      if (!referencePath.parentPath.isCallExpression()) {
        throw makeError(
          errorMessages.runOnServerNotCalledDirectly,
          referencePath.node
        );
      }

      const callExpression = referencePath.parentPath;
      const code = callExpression.get("arguments")[0];
      // Handle runOnServer();
      if (code == null) {
        throw makeError(
          errorMessages.runOnServerCalledWithoutArguments,
          callExpression.node
        );
      }

      function transform(
        node,
        scope,
        pathToReplace,
        nodeToGetSourceFrom = node
      ) {
        // Handle irregular cases like runOnServer(2 + 2)
        if (
          !(
            t.isTemplateLiteral(node) ||
            t.isStringLiteral(node) ||
            t.isArrowFunctionExpression(node) ||
            t.isFunctionExpression(node) ||
            t.isIdentifier(node)
          )
        ) {
          throw makeError(
            errorMessages.runOnServerCalledWithInvalidExpression,
            node
          );
        }

        // Handle eg. runOnServer(`${foo}`)
        if (t.isTemplateLiteral(node) && node.expressions.length > 0) {
          throw makeError(
            errorMessages.runOnServerCalledWithTemplateLiteralWithExpressions,
            node
          );
        }

        if (t.isIdentifier(node)) {
          const binding = scope.bindings[node.name];
          if (binding == null) {
            throw makeError(
              errorMessages.runOnServerCalledWithOrphanedBinding,
              node
            );
          }

          // Handle eg:
          // let foo = function(one) {};
          // foo = function(two) {};
          // runOnServer(foo);
          if (!binding.constant) {
            throw makeError(
              errorMessages.runOnServerCalledWithNonConstantBinding,
              node
            );
          }

          // Handle eg:
          // function foo() {}
          // runOnServer(foo)
          if (binding.path.isFunctionDeclaration()) {
            const functionDeclaration = binding.path.node;
            const functionExpression = t.functionExpression(
              functionDeclaration.id,
              functionDeclaration.params,
              functionDeclaration.body,
              functionDeclaration.generator,
              functionDeclaration.async
            );

            transform(
              functionExpression,
              scope,
              pathToReplace,
              functionDeclaration
            );
            return;
          } else if (
            binding.path.isVariableDeclarator() &&
            binding.path.node.init != null
          ) {
            const init = binding.path.node.init;
            transform(init, scope, pathToReplace);
            return;
          } else {
            throw makeError(
              errorMessages.runOnServerCalledWithOrphanedBinding,
              node
            );
          }
        }

        const codeId = makeIdForNode(nodeToGetSourceFrom, state);
        mappings[codeId] = JSON.parse(JSON.stringify(node));
        pathToReplace.replaceWith(
          t.objectExpression([
            t.objectProperty(t.identifier("id"), t.stringLiteral(codeId)),
          ])
        );
      }

      transform(code.node, code.scope, code);
    });
  });

  fs.writeFileSync(outputPath, buildIdMappingsFile(mappings));
}
