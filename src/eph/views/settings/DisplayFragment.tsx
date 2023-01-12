import {
  BadgeButton,
  Button,
  Checkbox,
  Hyperlink,
  TextField,
  TinyTextField,
} from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { openInBrowser } from "common/utils/open";
import RadioButton from "eph/components/RadioButton";
import SectionTitle from "eph/components/SectionTitle";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";
import { MdAdd } from "react-icons/md";

const SettingsDisplayFragment = observer(() => {
  return (
    <div className="space-y-2">
      <SectionTitle>News</SectionTitle>
      <Checkbox
        checked={configStore.news}
        onChange={(checked) => setConfig((cfg) => (cfg.news = checked))}
      >
        {t("settings.showNews")}
      </Checkbox>
      <TextField
        label="News Title Amount"
        type="number"
        value={configStore.newsTitleAmount.toString()}
        onChange={(value) =>
          setConfig((cfg) => (cfg.newsTitleAmount = parseInt(value)))
        }
        min={2}
        max={20}
        helperText="How many news titles are there on your home page? Accepted values are from 2 to 20."
      />
      <div className="text-sm text-shallow">
        From{" "}
        <Hyperlink onClick={() => openInBrowser("https://www.mcbbs.net")}>
          MCBBS
        </Hyperlink>
      </div>
      <SectionTitle>{t("settings.hitokoto")}</SectionTitle>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === false}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = false))}
        />
        Disable
      </div>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === true}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = true))}
        />
        {t("settings.hitokoto")}
      </div>
      <div className="text-sm text-shallow">
        Display a random line of text provided by{" "}
        <Hyperlink onClick={() => openInBrowser("https://hitokoto.cn")}>
          Hitokoto
        </Hyperlink>{" "}
        on your homepage. (Chinese Simplified Contents)
      </div>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === "custom"}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = "custom"))}
        />
        Custom
      </div>
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
              Remove
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
