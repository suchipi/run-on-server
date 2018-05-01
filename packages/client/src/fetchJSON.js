/* @flow */
const XMLHttpRequest = require("./xhr");

export default function fetchJSON(
  method: string,
  url: string,
  data: Object | Array<mixed>,
  sync: boolean = false
): any {
  let resolve = (val: any) => {};
  let reject = (err: Error) => {};

  const promise = new Promise((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  const handleError = (err) => {
    if (sync) {
      throw err;
    } else {
      reject(err);
    }
  };

  try {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, !sync);

    if (!sync) {
      xhr.timeout = 30000;
    }

    xhr.onload = xhr.onreadystatechange = (event) => {
      if (xhr.readyState === 4) {
        resolve(xhr.responseText);
      }
    };

    xhr.onerror = (event) => {
      handleError(new Error(xhr.statusText));
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(JSON.stringify(data));

    let returnValue;
    if (sync) {
      returnValue = JSON.parse(xhr.responseText);
    } else {
      returnValue = promise.then((responseData) => JSON.parse(responseData));
    }
    return returnValue;
  } catch (err) {
    handleError(err);
  }
}
