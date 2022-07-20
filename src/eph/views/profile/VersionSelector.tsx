import { shift, useFloating } from "@floating-ui/react-dom";
import { Hyperlink, ListItem, TextField } from "@resetpower/rcs";
import { searchVersions } from "core/launch/versions";
import { t } from "eph/intl";
import { useEffect, useState, useCallback } from "react";

export default function VersionSelector(props: {
  dir: string;
  value: string;
  onChange: (value: string) => unknown;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<string[] | string | null>(null);
  const { x, y, refs, reference, floating, strategy } =
    useFloating<HTMLElement>({
      placement: "bottom",
      middleware: [shift()],
    });

  const onDocumentClick = useCallback(
    (event: Event) => {
      if (
        !refs.reference.current?.contains(event.target as Node) &&
        !refs.floating.current?.contains(event.target as Node)
      ) {
        setShow(false);
      }
    },
    [refs]
  );

  useEffect(
    () =>
      (show ? document.addEventListener : document.removeEventListener)(
        "click",
        onDocumentClick,
        false
      ),
    [show, onDocumentClick]
  );

  useEffect(() => {
    if (show) {
      try {
        setResult(searchVersions(props.dir));
      } catch {
        setResult(t("profiles.dirUnavailable"));
      }
    }
  }, [show, props.dir]);

  return (
    <>
      <div ref={reference}>
        <TextField
          label={t("version")}
          value={props.value}
          onChange={props.onChange}
          trailing={
            <Hyperlink onClick={() => setShow((show) => !show)} button>
              {t("profiles.searchVersion")}
            </Hyperlink>
          }
          required
        />
      </div>
      {show && (
        <div
          className={`bg-card text-contrast rounded-md shadow-md py-2 z-20`}
          ref={floating}
          style={{
            position: strategy,
            width: refs.reference.current?.offsetWidth,
            top: y ?? 0,
            left: x ?? 0,
          }}
        >
          {Array.isArray(result) ? (
            result.map((value, index) => (
              <ListItem
                onClick={() => {
                  props.onChange(value);
                  setShow(false);
                }}
                key={index}
                dependent
              >
                {value}
              </ListItem>
            ))
          ) : (
            <p className="px-3">{result}</p>
          )}
        </div>
      )}
    </>
  );
}
