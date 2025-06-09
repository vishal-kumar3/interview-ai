declare module 'pdf-extract' {
  interface ExtractOptions {
    type?: string;
    annotations?: boolean;
  }

  interface ExtractResult {
    text_pages: string[];
    annotations?: any[];
  }

  function extract(
    filePath: string,
    options: ExtractOptions,
    callback: (err: Error | null, data?: ExtractResult) => void
  ): void;

  export = extract;
}
