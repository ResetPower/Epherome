import Container from "../components/Container";
import Typography from "../components/Typography";
import Alert from "../components/Alert";
import { Component } from "react";
import { t } from "../renderer/global";
import { getProfile } from "../renderer/profiles";

export interface ProfileManagementPageProps {
  match: {
    isExact: boolean;
    params: { [key: string]: string };
    path: string;
    url: string;
  };
}
export type ProfileManagementPageState = Record<string, never>;

export default class ProfileManagementPage extends Component<
  ProfileManagementPageProps,
  ProfileManagementPageState
> {
  constructor(props: ProfileManagementPageProps) {
    super(props);
  }
  render(): JSX.Element {
    const profile = getProfile(Number(this.props.match.params.id));
    return (
      <Container className="eph-page">
        {profile === null ? (
          <Alert severity="error">Sorry. Profile Id Not Found.</Alert>
        ) : (
          <div>
            <Typography>{t("notSupportedYet")}</Typography>
          </div>
        )}
      </Container>
    );
  }
}
