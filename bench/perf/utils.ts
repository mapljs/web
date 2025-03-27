export interface Test {
  name: string;
  fn: {
    fetch: (req: Request) => any
  };
}

export const createTest = <const T extends Test>(x: T): T => x;
