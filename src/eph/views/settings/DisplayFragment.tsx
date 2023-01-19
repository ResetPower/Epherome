import {
  BadgeButton,
  Button,
  Checkbox,
  Hyperlink,
  TextField,
  TinyTextField,
  WithHelper,
} from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { openInBrowser } from "common/utils/open";
import SectionTitle from "eph/components/SectionTitle";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";
import { MdAdd } from "react-icons/md";
import { homePageStore } from "../home/store";

const SettingsDisplayFragment = observer(() => {
  return (
    <div className="space-y-2">
      <SectionTitle>{t("news")}</SectionTitle>
      <WithHelper helper={t("news.description")}>
        <Checkbox
          checked={configStore.news}
          onChange={(checked) => setConfig((cfg) => (cfg.news = checked))}
        >
          {t("settings.showNews")}
        </Checkbox>
      </WithHelper>
      <TextField
        label={t("newsTitleAmount")}
        type="number"
        value={configStore.newsTitleAmount.toString()}
        onChange={(value) =>
          setConfig((cfg) => (cfg.newsTitleAmount = parseInt(value)))
        }
        min={1}
        max={10}
        helperText={t("newsTitleAmount.description", "[1, 10]")}
      />
      <SectionTitle>{t("settings.hitokoto")}</SectionTitle>
      <Checkbox
        checked={configStore.hitokotoRefreshButton}
        onChange={(value) =>
          setConfig((cfg) => (cfg.hitokotoRefreshButton = value))
        }
      >
        {t("showRefreshButton")}
      </Checkbox>
      <Checkbox
        checked={configStore.hitokoto === false}
        onChange={(value) =>
          value && setConfig((cfg) => (cfg.hitokoto = false))
        }
      >
        {t("disabled")}
      </Checkbox>
      <Checkbox
        checked={configStore.hitokoto === true}
        onChange={(value) =>
          value &&
          setConfig((cfg) => (cfg.hitokoto = true)) &&
          homePageStore.reloadHitokoto()
        }
      >
        {t("settings.hitokoto")}
      </Checkbox>
      <div className="text-sm text-shallow">
        Display a random line of text provided by{" "}
        <Hyperlink onClick={() => openInBrowser("https://hitokoto.cn")}>
          Hitokoto
        </Hyperlink>{" "}
        on your homepage. (Chinese Simplified Contents)
      </div>
      <Checkbox
        checked={configStore.hitokoto === "custom"}
        onChange={(value) =>
          value &&
          setConfig((cfg) => (cfg.hitokoto = "custom")) &&
          homePageStore.reloadHitokoto()
        }
      >
        {t("custom")}
      </Checkbox>
      <div className="py-1">
        {configStore.customHitokotoList.map((value, index) => (
          <div className="flex items-center w-full py-1 space-x-1" key={index}>
            <TinyTextField
              value={value.content}
              onChange={(v) => setConfig(() => (value.content = v))}
              className="flex-grow"
            />
            <div className="text-shallow">——</div>
            <TinyTextField
              value={value.from}
              onChange={(v) => setConfig(() => (value.from = v))}
            />
            <BadgeButton
              onClick={() =>
                setConfig(
                  (cfg) =>
                    (cfg.customHitokotoList = cfg.customHitokotoList.filter(
                      (hk) => hk !== value
                    ))
                )
              }
            >
              {t("remove")}
            </BadgeButton>
          </div>
        ))}
        <Button
          onClick={() =>
            setConfig((cfg) =>
              cfg.customHitokotoList.push({ content: "Content", from: "From" })
            )
          }
          className="w-full"
        >
          <MdAdd /> {t("add")}
        </Button>
      </div>
    </div>
  );
});

export default SettingsDisplayFragment;
