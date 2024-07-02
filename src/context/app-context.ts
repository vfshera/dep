import { createContextId, useContext } from "@builder.io/qwik";

export type AppContext = {
  sidebarCollapsed: boolean;
};

export const AppContext = createContextId<AppContext>("app-context");

export const useAppContext = () => {
  return useContext(AppContext);
};
