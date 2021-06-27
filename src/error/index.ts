export class EpheromeError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "EpheromeError";
  }
}
