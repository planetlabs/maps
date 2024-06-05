export function callback(func) {
  let onComplete;
  let onError;

  function handler(...args) {
    let result;
    try {
      result = func(...args);
    } catch (error) {
      onError(error);
    }
    onComplete(result);
  }

  const called = new Promise((resolve, reject) => {
    onComplete = resolve;
    onError = reject;
  });

  return {handler, called};
}
