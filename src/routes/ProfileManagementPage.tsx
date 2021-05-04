import { Container, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { FunctionComponentElement } from "react";
import { useParams } from "react-router";
import { t } from "../renderer/global";
import { getProfile } from "../renderer/profiles";

export interface ProfileManagementPageProps {
  id: string;
}

export default function ProfileManagementPage(): FunctionComponentElement<EmptyProps> {
  const id = useParams<ProfileManagementPageProps>().id;
  const profile = getProfile(Number(id));
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
