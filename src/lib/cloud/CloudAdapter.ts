export interface CloudAdapter {
  listFiles(): Promise<string[]>;
  readFile(filename: string): Promise<string | null>;
  writeFile(filename: string, content: string): Promise<void>;
  deleteFile(filename: string): Promise<void>;
}
