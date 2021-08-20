import { List, ListItem } from "../components/lists";
import { t } from "../intl";
import { homePageStore } from "./HomePage";
import { useOverlayCloser } from "../renderer/overlays";
import { BottomSheet, BottomSheetTitle } from "../components/sheets";
import { openInBrowser } from "common/utils/open";

export default function NewsView(): JSX.Element {
  const close = useOverlayCloser();

  return (
    <BottomSheet>
      <div
        className="w-11/12 bg-card rounded-t-xl overflow-y-auto"
        style={{ height: "calc(100vh * 0.833333)" }}
      >
        <BottomSheetTitle close={close}>{t("news")}</BottomSheetTitle>
        <List>
          {homePageStore.news?.map((val, index) => (
            <ListItem
              className="rounded-lg items-center px-9 py-3ß m-1"
              key={index}
            >
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
      </div>
    </BottomSheet>
  );
}
