import { List, ListItem } from "@resetpower/rcs";
import { homePageStore } from "./HomePage";
import { openInBrowser } from "common/utils/open";

export default function NewsView(): JSX.Element {
  return (
    <List>
      {homePageStore.news?.map((val, index) => (
        <ListItem className="rounded-lg items-center px-9 m-1" key={index}>
          <p
            className="text-contrast hover:text-shallow cursor-pointer select-none transition-colors"
            onClick={() => openInBrowser(val.url)}
          >
            {val.title}
          </p>
          <div className="flex-grow" />
          <div className="flex flex-col items-end">
            <p>{val.author}</p>
            <p className="text-shallow">{val.time}</p>
          </div>
        </ListItem>
      ))}
    </List>
  );
}
