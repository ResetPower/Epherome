import CounterPage from "../pages/CounterPage";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/accounts/AccountsPage";
import InstancesPage from "../pages/instances/InstancesPage";
import SettingsPage from "../pages/settings/SettingsPage";

export const routeMap = {
  home: () => <HomePage />,
  accounts: () => <AccountsPage />,
  instances: () => <InstancesPage />,
  counter: () => <CounterPage />,
  settings: () => <SettingsPage />,
};

export type RouteName = keyof typeof routeMap;
