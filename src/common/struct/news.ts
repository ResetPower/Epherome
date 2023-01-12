import got from "got";

export interface NewItem {
  title: string;
  author: string;
  time: string;
  url?: string;
}

export async function fetchNews(): Promise<NewItem[] | null> {
  try {
    const resp = await got("https://epherome.com/news.json");
    return JSON.parse(resp.body);
  } catch (e) {
    console.error(e);
    return null;
  }
}
