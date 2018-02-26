import cases from "jest-in-case";
import compile from "../src/util/compile";

const clean = (str) =>
  str
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

cases(
  "normal usage",
  ({ input }) => {
    const { code, output } = compile(input);
    console.log(code);
    console.log(output);
    expect(code).toMatchSnapshot();
    expect(output).toMatchSnapshot();
  },
  []
);
