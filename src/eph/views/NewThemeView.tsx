import {
  Link,
  RCSPalette,
  RCSTheme,
  TextField,
  twColors,
} from "@resetpower/rcs";
import { setConfig } from "common/struct/config";
import UIPalette, { PaletteColor } from "eph/components/UIPalette";
import { t } from "eph/intl";
import { overlayStore } from "eph/overlay";
import { Fragment, useState } from "react";
import {
  MdCheck,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
} from "react-icons/md";

type ThemeType = "light" | "dark";

function usePaletteColor(
  a: keyof typeof twColors,
  b: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 0
): [PaletteColor, (color: PaletteColor) => void] {
  return useState<PaletteColor>({
    majorType: a,
    minorType: `${b}`,
    hex: b === 0 ? (twColors[a] as string) : twColors[a][b],
  });
}

export default function NewThemeView(): JSX.Element {
  const [name, setName] = useState("");
  const [err, setErr] = useState(false);
  const [type, setType] = useState<ThemeType>("light");
  const [background, setBackground] = usePaletteColor("gray", 100);
  const [primary, setPrimary] = usePaletteColor("blue", 500);
  const [secondary, setSecondary] = usePaletteColor("pink", 500);
  const [shallow, setShallow] = usePaletteColor("gray", 400);
  const [divider, setDivider] = usePaletteColor("gray", 200);
  const [card, setCard] = usePaletteColor("white", 0);
  const [contrast, setContrast] = usePaletteColor("black", 0);
  const [danger, setDanger] = usePaletteColor("red", 500);

  const createTheme = () => {
    if (name === "") {
      setErr(true);
    } else {
      const theme: RCSTheme = {
        name,
        type,
        palette: Object.entries({
          background,
          primary,
          secondary,
          shallow,
          divider,
          card,
          contrast,
          danger,
        })
          .map(([k, v]) => [k, v.hex])
          .reduce(
            (r, [k, v]) => Object.assign(r, { [k]: v }),
            {}
          ) as RCSPalette,
      };
      setConfig((cfg) => cfg.themeList.push(theme));
      overlayStore.close();
    }
  };

  return (
    <div className="flex flex-col p-3">
      <div className="flex space-x-3 w-1/2 justify-center items-center">
        <p className="rcs-label w-24">Type</p>
        <div className="flex space-x-3 w-56">
          {["light", "dark"].map((t, i) => (
            <Fragment key={i}>
              <div
                className="text-pink-400 hover:text-pink-500 cursor-pointer"
                onClick={() => setType(t as ThemeType)}
              >
                {type === t ? (
                  <MdRadioButtonChecked />
                ) : (
                  <MdRadioButtonUnchecked />
                )}
              </div>
              <p className="capitalize">{t}</p>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="flex-grow grid grid-cols-2 mb-6 mt-3">
        <UIPalette
          label="Background"
          color={background}
          onChange={setBackground}
        />
        <UIPalette label="Primary" color={primary} onChange={setPrimary} />
        <UIPalette
          label="Secondary"
          color={secondary}
          onChange={setSecondary}
        />
        <UIPalette label="Shallow" color={shallow} onChange={setShallow} />
        <UIPalette label="Divider" color={divider} onChange={setDivider} />
        <UIPalette label="Card" color={card} onChange={setCard} />
        <UIPalette label="Contrast" color={contrast} onChange={setContrast} />
        <UIPalette label="Danger" color={danger} onChange={setDanger} />
      </div>
      <TextField
        value={name}
        onChange={(n) => {
          if (err) {
            setErr(false);
          }
          setName(n);
        }}
        placeholder={t("name")}
        trailing={
          <Link onClick={createTheme}>
            <MdCheck />
          </Link>
        }
      />
    </div>
  );
}
