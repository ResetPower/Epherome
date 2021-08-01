import { Typography, Container } from "../components/layouts";
import { t } from "../intl";

export default function ExtensionsPage(): JSX.Element {
  return (
    <Container>
      <Typography>{t("notSupportedYet")}</Typography>
    </Container>
  );
}
