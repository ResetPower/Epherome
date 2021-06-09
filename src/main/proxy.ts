import { ipcMain } from "electron";
import nodeFetch from "node-fetch";
import { EphResponse } from "../tools/types";

ipcMain.handle("http", async (_evm, args): Promise<EphResponse> => {
  const result = await nodeFetch(args[0], args[1]);
  return {
    text: await result.text(),
    status: result.status,
  };
});
