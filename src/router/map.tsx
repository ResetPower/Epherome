import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/accounts/AccountsPage";
import InstancesPage from "../pages/instances/InstancesPage";
import SettingsPage from "../pages/settings/SettingsPage";
import DebugPanel from "../pages/DebugPanel";

export const routeMap = {
  home: () => <HomePage />,
  accounts: () => <AccountsPage />,
  instances: () => <InstancesPage />,
  settings: () => <SettingsPage />,
  debug: () => <DebugPanel />,
};

export type RouteName = keyof typeof routeMap;
