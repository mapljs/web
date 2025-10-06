export interface StreamSource<R> extends UnderlyingSource<R> {
  controller: ReadableStreamDefaultController<R>;
  stream: ReadableStream<R>;
}

function start<T>(
  this: StreamSource<any>,
  controller: ReadableStreamDefaultController<any>,
) {
  this.controller = controller;
}

export const init = <R>(
  queueingStrategy?: QueuingStrategy<R>,
): StreamSource<R> => {
  const source: StreamSource<R> = {
    controller: null!,
    stream: null!,
    start,
  };
  source.stream = new ReadableStream(source, queueingStrategy);
  return source;
};
