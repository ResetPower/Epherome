interface Native {
  hello(): string;
}

interface Window {
  native: Native;
}
