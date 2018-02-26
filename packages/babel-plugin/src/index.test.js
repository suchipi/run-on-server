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

cases(
  "normal usage",
  ({ input }) => {
    [preludeImport, preludeCJS].forEach((prelude) => {
      const { code, output } = compile(prelude + input);
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
      `,
    },
  ]
);

cases(
  "errors",
  ({ input }) => {
    expect(() => {
      compile(input);
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
