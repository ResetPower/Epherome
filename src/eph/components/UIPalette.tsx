import { FloatingView, twColors } from "@resetpower/rcs";
import { DefaultFn } from "common/utils";

export function parseForegroundWhite(bgHex: string): boolean {
  if (bgHex === "#000") {
    return true;
  }
  const rgb = bgHex
    .slice(1)
    .match(/.{1,2}/g)
    ?.map((value) => parseInt(value, 16));
  if (rgb && rgb.length === 3) {
    const [R, G, B] = rgb;
    const Y = 0.299 * R + 0.587 * G + 0.114 * B;
    if (Y < 192) {
      return true;
    }
  }
  return false;
}

export interface PaletteColor {
  majorType: string;
  minorType?: string;
  hex: string;
}

export function UIPaletteColor(props: {
  color: string;
  onClick: DefaultFn;
  checked?: boolean;
}): JSX.Element {
  return (
    <div
      className={`h-4 w-4 align-middle border cursor-pointer ${
        props.checked ? "border-black" : "border-divider"
      }`}
      style={{ background: props.color }}
      onClick={props.onClick}
    />
  );
}

export default function UIPalette(props: {
  label: string;
  color: PaletteColor;
  onChange: (color: PaletteColor) => unknown;
  blackAndWhite?: boolean;
}): JSX.Element {
  return (
    <FloatingView
      className="p-3"
      opener={
        <div className="flex justify-center items-center">
          <p className="rcs-label w-24">{props.label}</p>
          <div>
            <button
              className="rounded-md py-1 px-2 text-sm w-56 m-2"
              style={{
                background: props.color.hex,
                color: parseForegroundWhite(props.color.hex)
                  ? "white"
                  : "black",
              }}
            >
              {props.color.majorType}
              {props.color.minorType && `-${props.color.minorType}`} (
              {props.color.hex})
            </button>
          </div>
        </div>
      }
    >
      <div className="flex items-center space-x-1">
        {!props.blackAndWhite && <p className="rcs-label w-14">Plain</p>}
        <UIPaletteColor
          checked={props.color.majorType === "black"}
          color={twColors.black}
          onClick={() =>
            props.onChange({ majorType: "black", hex: twColors.black })
          }
        />
        <UIPaletteColor
          checked={props.color.majorType === "white"}
          color={twColors.white}
          onClick={() =>
            props.onChange({ majorType: "white", hex: twColors.white })
          }
        />
      </div>
      {Object.entries(twColors).map(
        ([k, v], i) =>
          k !== "black" &&
          k !== "white" && (
            <div className="flex items-center space-x-1" key={i}>
              <p className="capitalize rcs-label w-14">{k}</p>
              {Object.entries(v).map(([l, w], j) => (
                <UIPaletteColor
                  checked={props.color.hex === w}
                  key={j}
                  color={w}
                  onClick={() =>
                    props.onChange({ majorType: k, minorType: l, hex: w })
                  }
                />
              ))}
            </div>
          )
      )}
    </FloatingView>
  );
}
