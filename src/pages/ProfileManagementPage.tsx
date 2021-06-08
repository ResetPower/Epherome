import Container from "../components/Container";
import Alert from "../components/Alert";
import { Component } from "react";
import { t } from "../renderer/global";
import { getProfile } from "../renderer/profiles";

export interface ProfileManagementPageProps {
  params: { [key: string]: string };
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
    const profile = getProfile(Number(this.props.params.id));
    return (
      <Container>
        {profile === null ? (
          <Alert severity="error">Sorry. Profile Id Not Found.</Alert>
        ) : (
          <div>
            <p>{t("notSupportedYet")}</p>
          </div>
        )}
      </Container>
    );
  }
}
