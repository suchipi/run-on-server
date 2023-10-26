// @flow
import * as React from "react";

type Props = {
  error: Error,
  style?: Object,
};

export default class ErrorDisplay extends React.Component<Props> {
  render() {
    const { error, style } = this.props;

    console.error(error);

    return (
      <code style={{ color: "#f92672", backgroundColor: "#23241f", ...style }}>
        {String(error)}
        {"\n"}
        {String(error.stack)}
      </code>
    );
  }
}
