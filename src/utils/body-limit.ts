export default async (req: Request, bytes: number): Promise<boolean> => {
  if (req.body !== null) {
    const bodyLen = req.headers.get('content-length');
    if (bodyLen !== null && !req.headers.has('transfer-encoding'))
      return +bodyLen <= bytes;

    try {
      const reader = req.clone().body!.getReader();
      let chunk = await reader.read();
      let size = 0;

      while (!chunk.done) {
        size += chunk.value.byteLength;
        if (size > bytes) return false;
        chunk = await reader.read();
      }
    } catch {
      // Error when reading body
      return false;
    }
  }

  return true;
};
