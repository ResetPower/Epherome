export function resolve<T>(formData: FormData): T {
  const obj: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    obj[k] = v as string;
  }
  return obj as T;
}

export function uuidv4() {
  let result = "";
  for (let j = 0; j < 32; j++) {
    const i = Math.floor(Math.random() * 16)
      .toString(16)
      .toLowerCase();
    result = result + i;
  }
  return result;
}

export type ConcatElement = string | false | undefined;

export function concat(...elements: ConcatElement[]) {
  return elements.filter((x) => typeof x === "string").join(" ");
}

export type Status = "unavailable" | "loading" | "positive" | "negative";
