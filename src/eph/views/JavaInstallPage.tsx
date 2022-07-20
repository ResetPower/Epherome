import { match } from "common/utils";
import { Center, Hyperlink, ListItem } from "@resetpower/rcs";
import { t } from "eph/intl";
import { useState } from "react";
import { openInBrowser } from "common/utils/open";

export default function JavaInstallPage(): JSX.Element {
  const [selection, setSelection] = useState(0);

  const matched = match(
    selection,
    [0, "https://www.oracle.com/java/technologies/downloads/"],
    [1, "https://adoptium.net/"],
    [2, "https://www.eclipse.org/openj9/"],
    [3, "https://www.azul.com/downloads/?package=jdk"],
    [4, "https://dragonwell-jdk.io/"]
  );

  return (
    <div className="flex eph-h-full">
      <div className="w-1/4 bg-card shadow-sm">
        {["OracleJDK", "AdoptOpenJDK", "OpenJ9", "ZuluJDK", "DragonWell"].map(
          (value, index) => (
            <ListItem
              className="rounded-md px-3 py-2 m-2"
              active={selection === index}
              onClick={() => setSelection(index)}
              key={index}
            >
              {value}
            </ListItem>
          )
        )}
      </div>
      <div className="w-3/4">
        <Center className="text-shallow">
          <div>
            <p>{t("notSupportedYet")}</p>
            <p>{t("java.pleaseGoTo")}</p>
            {matched && (
              <Hyperlink onClick={() => openInBrowser(matched)}>
                {matched}
              </Hyperlink>
            )}
          </div>
        </Center>
      </div>
    </div>
  );
}
