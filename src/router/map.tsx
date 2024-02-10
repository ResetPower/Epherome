import CounterPage from "../pages/CounterPage";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/accounts/AccountsPage";
import ProfilesPage from "../pages/profiles/ProfilesPage";
import SettingsPage from "../pages/settings/SettingsPage";

export const routeMap = {
  home: () => <HomePage />,
  accounts: () => <AccountsPage />,
  profiles: () => <ProfilesPage />,
  counter: () => <CounterPage />,
  settings: () => <SettingsPage />,
};

export type RouteName = keyof typeof routeMap;
