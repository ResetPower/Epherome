import got from "got";
import parser from "node-html-parser";

// Note that all the news is from MCBBS (A Chinese Minecraft Forum)
// So we will not support English/Japanese/OtherLanguages' news until we find other news API to replace it
// Or you can tell me in the issues if you know some news API (If you have read this line of code)

export interface NewItem {
  title: string;
  author: string;
  time: string;
  url: string;
}

export async function fetchNews(): Promise<NewItem[]> {
  const list: NewItem[] = [];
  const result = await got("https://www.mcbbs.net/forum-news-1.html");
  const doc = parser(result.body);
  const news = doc.querySelectorAll("#threadlisttableid > tbody");
  for (const i of news) {
    if (i.id.startsWith("normalthread_")) {
      const threadId = i.id.substring(13);
      const osrs: NewItem = {
        title: "",
        author: i.querySelector("tr > .by > cite > a")?.innerHTML ?? "",
        time: (
          i.querySelector("tr > .by > em > span > span")?.innerHTML ??
          i.querySelector("tr > .by > em > span")?.innerHTML ??
          ""
        ).replace("&nbsp;", " "),
        url: `https://www.mcbbs.net/thread-${threadId}-1-1.html`,
      };
      [
        i.querySelector("tr > .common > .s.xst"),
        i.querySelector("tr > .new > .s.xst"),
        i.querySelector("tr > .lock > .s.xst"),
      ].forEach((title) => title && (osrs.title = title.innerHTML));
      list.push(osrs);
    }
  }
  return list;
}
