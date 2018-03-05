import path from "path";
import * as t from "babel-types";
import importsVisitor from "imports-visitor";
import * as errorMessages from "./errorMessages";
import makeIdForNode from "./makeIdForNode";
import IdMappingsFile from "./IdMappingsFile";

module.exports = function() {
  return {
    visitor: {
      Program(programPath, state) {
        let outputPath = path.join(
          process.cwd(),
          "run-on-server-id-mappings.js"
        );

        const options = {
          idMappings: {
            enabled: Boolean(
              this.opts && this.opts.idMappings && this.opts.idMappings.enabled
            ),
            outputPath:
              this.opts && this.opts.idMappings && this.opts.idMappings.enabled
                ? this.opts.idMappings.outputPath
                : undefined,
          },
          evalRequire: {
            enabled: Boolean(
              this.opts &&
                this.opts.evalRequire &&
                this.opts.evalRequire.enabled
            ),
          },
        };

        if (options.idMappings.outputPath) {
          if (path.isAbsolute(options.idMappings.outputPath)) {
            outputPath = options.idMappings.outputPath;
          } else {
            outputPath = path.resolve(
              process.cwd(),
              options.idMappings.outputPath
            );
          }
        }

        const idMappingsFile = new IdMappingsFile(outputPath);

        const imports = [];
        programPath.traverse(importsVisitor, { imports });
        imports.forEach((importDef) => {
          if (importDef.source !== "run-on-server/client") {
            return;
          }

          handleClientImport(importDef, idMappingsFile, state, options);
        });
      },
    },
  };
};

function handleClientImport(importDef, idMappingsFile, state, options) {
  const binding = importDef.path.findParent((parent) => parent.isStatement())
    .scope.bindings[importDef.variableName];
  const references = binding.referencePaths;

  if (!(options.idMappings.enabled || options.evalRequire.enabled)) {
    return;
  }

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

      function transformEvalRequires() {
        if (
          !(t.isArrowFunctionExpression(code) || t.isFunctionExpression(code))
        ) {
          return;
        }

        code.get("body").traverse({
          Identifier(path) {
            if (path.node.name !== "require") {
              return;
            }
            path.replaceWith(
              t.callExpression(t.identifier("eval"), [
                t.stringLiteral("require"),
              ])
            );
          },
        });
      }

      if (options.evalRequire.enabled) {
        transformEvalRequires();
      }

      function transformIdMappings(
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

            transformIdMappings(
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
            transformIdMappings(init, scope, pathToReplace);
            return;
          } else {
            throw makeError(
              errorMessages.runOnServerCalledWithOrphanedBinding,
              node
            );
          }
        }

        const codeId = makeIdForNode(nodeToGetSourceFrom, state);
        idMappingsFile.add(codeId, JSON.parse(JSON.stringify(node)));
        pathToReplace.replaceWith(
          t.objectExpression([
            t.objectProperty(t.identifier("id"), t.stringLiteral(codeId)),
          ])
        );
      }

      if (options.idMappings.enabled) {
        transformIdMappings(code.node, code.scope, code);
      }
    });
  });
}
