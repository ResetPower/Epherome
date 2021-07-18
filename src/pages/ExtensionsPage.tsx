import { Typography, Container } from "../components/layouts";
import { t } from "../renderer/global";

export default function ExtensionsPage(): JSX.Element {
  return (
    <Container>
      <Typography>{t.notSupportedYet}</Typography>
    </Container>
  );
}
