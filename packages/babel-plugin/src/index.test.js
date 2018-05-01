import cases from "jest-in-case";
import compile from "../src/util/compile";

const preludeImport = `
  import createClient from "run-on-server/client";

  const runOnServer = createClient("http://localhost:3000");
`;
const preludeCJS = `
  const createClient = require("run-on-server/client");

  const runOnServer = createClient("http://localhost:3000");
`;

describe("id mappings", () => {
  cases(
    "normal usage",
    ({ input }) => {
      [preludeImport, preludeCJS].forEach((prelude) => {
        const { code, output } = compile(prelude + input, {
          idMappingsEnabled: true,
        });
        expect(code).toMatchSnapshot();
        expect(output).toMatchSnapshot();
      });
    },
    [
      {
        name: "string",
        input: `
          runOnServer("args");
          runOnServer("args", [1, 2, 3]);
          runOnServer(\`args\`);
          runOnServer(\`args\`, [1, 2, 3]);
          runOnServer.sync("args");
          runOnServer.sync("args", [1, 2, 3]);
          runOnServer.sync(\`args\`);
          runOnServer.sync(\`args\`, [1, 2, 3]);
        `,
      },
      {
        name: "function expression",
        input: `
          runOnServer(() => 5);
          runOnServer(async () => 5);
          runOnServer(x => x, [5]);
          runOnServer(async x => x, [5]);
          runOnServer(function() { return 5; });
          runOnServer(async function() { return 5; });
          runOnServer(function(x) { return x; }, 5);
          runOnServer(async function(x) { return x; }, 5);
          runOnServer(function serverCode() { return 5; });
          runOnServer(async function serverCode() { return 5; });
          runOnServer(function serverCode(x) { return x; }, 5);
          runOnServer(async function serverCode(x) { return x; }, 5);
          runOnServer.sync(() => 5);
          runOnServer.sync(async () => 5);
          runOnServer.sync(x => x, [5]);
          runOnServer.sync(async x => x, [5]);
          runOnServer.sync(function() { return 5; });
          runOnServer.sync(async function() { return 5; });
          runOnServer.sync(function(x) { return x; }, 5);
          runOnServer.sync(async function(x) { return x; }, 5);
          runOnServer.sync(function serverCode() { return 5; });
          runOnServer.sync(async function serverCode() { return 5; });
          runOnServer.sync(function serverCode(x) { return x; }, 5);
          runOnServer.sync(async function serverCode(x) { return x; }, 5);
        `,
      },
      {
        name: "function declaration",
        input: `
          function foo() {
            return 6;
          }
  
          async function bar() {
            return 7;
          }
  
          function qux(x) {
            return x;
          }
  
          async function qid(y, z) {
            return y + z;
          }
  
          runOnServer(foo);
          runOnServer(bar);
          runOnServer(qux, [5]);
          runOnServer(qid, [5, 6]);
          runOnServer.sync(foo);
          runOnServer.sync(bar);
          runOnServer.sync(qux, [5]);
          runOnServer.sync(qid, [5, 6]);
        `,
      },
      {
        name: "variable of variable of variable",
        input: `
          function foo() {
            return 5;
          }
  
          const bar = foo;
          const qux = bar;
  
          runOnServer(qux);
          runOnServer.sync(qux);
        `,
      },
    ]
  );

  cases(
    "errors",
    ({ input }) => {
      expect(() => {
        compile(input, { idMappingsEnabled: true });
      }).toThrowErrorMatchingSnapshot();
    },
    [
      {
        name: "create client result not saved to variable",
        input: `
          import createClient from "run-on-server/client";
  
          createClient("http://localhost:3000")("args");
        `,
      },
      {
        name:
          "create client result not saved to variable (custom createClient name)",
        input: `
          import client from "run-on-server/client";
  
          client("http://localhost:3000")("args");
        `,
      },
      {
        name: "create client result not saved to variable as identifier",
        input: `
          import createClient from "run-on-server/client";
  
          const { apply, call } = createClient("http://localhost:3000");
        `,
      },
      {
        name:
          "create client result not saved to variable as identifier (custom createClient name)",
        input: `
          import client from "run-on-server/client";
  
          const { apply, call } = client("http://localhost:3000");
        `,
      },
      {
        name: "runOnServer not called directly",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
  
          module.exports = runOnServer;
        `,
      },
      {
        name: "runOnServer not called directly (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
  
          module.exports = run;
        `,
      },
      {
        name: "runOnServer called without arguments",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
  
          runOnServer();
        `,
      },
      {
        name: "runOnServer called without arguments (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
  
          run();
        `,
      },
      {
        name: "runOnServer called with invalid expression",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
  
          runOnServer(2 + 2);
        `,
      },
      {
        name:
          "runOnServer called with invalid expression (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
  
          run(2 + 2);
        `,
      },
      {
        name: "runOnServer called with template literal with expressions",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
  
          runOnServer(\`console.log(\${process.env.NODE_ENV})\`);
        `,
      },
      {
        name:
          "runOnServer called with template literal with expressions (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
  
          run(\`console.log(\${process.env.NODE_ENV})\`);
        `,
      },
      {
        name: "runOnServer called with non-constant binding",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
  
          let code = "console.log('hi');";
          code = "args";
  
          runOnServer(code);
        `,
      },
      {
        name:
          "runOnServer called with non-constant binding (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
  
          let code = "console.log('hi');";
          code = "args";
  
          run(code);
        `,
      },
      {
        name: "runOnServer called with unresolvable binding",
        input: `
          import createClient from "run-on-server/client";
  
          const runOnServer = createClient("http://localhost:3000");
          runOnServer(asdfasdf);
        `,
      },
      {
        name:
          "runOnServer called with unresolvable binding (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
  
          const run = createClient("http://localhost:3000");
          run(asdfasdf);
        `,
      },
      {
        name: "runOnServer called with non-local binding",
        input: `
          import createClient from "run-on-server/client";
          import asdfasdf from "asdfasdf";
  
          const runOnServer = createClient("http://localhost:3000");
          runOnServer(asdfasdf);
        `,
      },
      {
        name:
          "runOnServer called with non-local binding (custom runOnServer name)",
        input: `
          import createClient from "run-on-server/client";
          import asdfasdf from "asdfasdf";
  
          const run = createClient("http://localhost:3000");
          run(asdfasdf);
        `,
      },
    ]
  );
});

describe("eval require replacement", () => {
  cases(
    "replaces require with eval('require')",
    ({ input }) => {
      [preludeImport, preludeCJS].forEach((prelude) => {
        const { code, output } = compile(prelude + input, {
          evalRequireEnabled: true,
        });
        expect(code).toMatchSnapshot();
        expect(output).toMatchSnapshot();
      });
    },
    [
      {
        name: "string", // no change
        input: `
          runOnServer("require('foo')");
          runOnServer("require('foo')", [1, 2, 3]);
          runOnServer(\`require('foo')\`);
          runOnServer(\`require('foo')\`, [1, 2, 3]);
          runOnServer.sync("require('foo')");
          runOnServer.sync("require('foo')", [1, 2, 3]);
          runOnServer.sync(\`require('foo')\`);
          runOnServer.sync(\`require('foo')\`, [1, 2, 3]);
        `,
      },
      {
        name: "function expression", // replaces require with eval("require")
        input: `
          runOnServer(() => require("foo"));
          runOnServer(async () => require("foo"));
          runOnServer(x => require("foo" + x), [5]);
          runOnServer(async x => require("foo"), [5]);
          runOnServer(function() { return require("foo"); });
          runOnServer(async function() { return require("foo"); });
          runOnServer(function(x) { return require("foo" + x); }, 5);
          runOnServer(async function(x) { return require("foo" + x); }, 5);
          runOnServer(function serverCode() { return require("foo"); });
          runOnServer(async function serverCode() { return require("foo"); });
          runOnServer(function serverCode(x) { return require("foo" + x); }, 5);
          runOnServer(async function serverCode(x) { return require("foo" + x); }, 5);
          runOnServer.sync(() => require("foo"));
          runOnServer.sync(async () => require("foo"));
          runOnServer.sync(x => require("foo" + x), [5]);
          runOnServer.sync(async x => require("foo"), [5]);
          runOnServer.sync(function() { return require("foo"); });
          runOnServer.sync(async function() { return require("foo"); });
          runOnServer.sync(function(x) { return require("foo" + x); }, 5);
          runOnServer.sync(async function(x) { return require("foo" + x); }, 5);
          runOnServer.sync(function serverCode() { return require("foo"); });
          runOnServer.sync(async function serverCode() { return require("foo"); });
          runOnServer.sync(function serverCode(x) { return require("foo" + x); }, 5);
          runOnServer.sync(async function serverCode(x) { return require("foo" + x); }, 5);
        `,
      },
      {
        name: "function declaration", // no change (might be used in client code)
        input: `
          function foo() {
            return require("foo");
          }
  
          async function bar() {
            return require("foo");
          }
  
          function qux(x) {
            return require("foo" + x);
          }
  
          async function qid(y, z) {
            return require("foo" + y + z);
          }
  
          runOnServer(foo);
          runOnServer(bar);
          runOnServer(qux, [5]);
          runOnServer(qid, [5, 6]);
          runOnServer.sync(foo);
          runOnServer.sync(bar);
          runOnServer.sync(qux, [5]);
          runOnServer.sync(qid, [5, 6]);
        `,
      },
      {
        name: "variable of variable of variable", // no change
        input: `
          function foo() {
            return require("foo");
          }
  
          const bar = foo;
          const qux = bar;
  
          runOnServer(qux);
          runOnServer.sync(qux);
        `,
      },
    ]
  );
});
