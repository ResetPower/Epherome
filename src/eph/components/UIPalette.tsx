import { FloatingView, twColors } from "@resetpower/rcs";
import { DefaultFn } from "common/utils";

export function parseForegroundWhite(bgHex: string): boolean {
  if (bgHex === "#000") {
    return true;
  }
  const rgb = bgHex.slice(1).match(/.{1,2}/g)?.map((value) => parseInt(value, 16));
  if (rgb && rgb.length === 3) {
    const [R, G, B] = rgb;
    const Y = 0.299 * R + 0.587 * G + 0.114 * B;
    return Y < 192;
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
  const { color, onClick, checked } = props;
  const borderColor = checked ? "border-black" : "border-divider";

  return (
    <div
      className={`h-4 w-4 align-middle border cursor-pointer ${borderColor}`}
      style={{ background: color }}
      onClick={onClick}
    />
  );
}

export default function UIPalette(props: {
  label: string;
  color: PaletteColor;
  onChange: (color: PaletteColor) => unknown;
  blackAndWhite?: boolean;
}): JSX.Element {
  const { label, color, onChange, blackAndWhite } = props;
  const { majorType, minorType, hex } = color;

  const renderPaletteColor = (color: string, majorType?: string, minorType?: string, checked?: boolean) => (
    <UIPaletteColor
      checked={checked}
      color={color}
      onClick={() => onChange({ majorType: majorType ?? "", minorType, hex: color })}
    />
  );

  const renderPaletteColors = () => {
    const paletteColors = [];

    if (!blackAndWhite) {
      paletteColors.push(
        <p className="rcs-label w-14" key="plain-label">Plain</p>,
        renderPaletteColor(twColors.black, "black"),
        renderPaletteColor(twColors.white, "white")
      );
    }

    for (const [majorType, minorTypes] of Object.entries(twColors)) {
      if (majorType !== "black" && majorType !== "white") {
        const paletteColorGroup = (
          <div className="flex items-center space-x-1" key={majorType}>
            <p className="capitalize rcs-label w-14">{majorType}</p>
            {Object.entries(minorTypes).map(([minorType, color]) =>
              renderPaletteColor(color, majorType, minorType, hex === color)
            )}
          </div>
        );

        paletteColors.push(paletteColorGroup);
      }
    }

    return paletteColors;
  };

  return (
    <FloatingView className="p-3" opener={
      <div className="flex justify-center items-center">
        <p className="rcs-label w-24">{label}</p>
        <div>
          <button
            className="rounded-md py-1 px-2 text-sm w-56 m-2"
            style={{
              background: hex,
              color: parseForegroundWhite(hex) ? "white" : "black"
            }}
          >
            {majorType}{minorType && `-${minorType}`} ({hex})
          </button>
        </div>
      </div>
    }>
      <div className="flex items-center space-x-1">
        {renderPaletteColors()}
      </div>
    </FloatingView>
  );
}
