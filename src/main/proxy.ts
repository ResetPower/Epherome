import { ipcMain } from "electron";
import nodeFetch from "node-fetch";
import { EphResponse } from "../tools/types";

ipcMain.handle("http", async (_evm, args): Promise<EphResponse> => {
  let err = false;
  let text = "";
  let status = 404;
  try {
    const result = await nodeFetch(args[0], args[1]);
    text = await result.text();
    status = result.status;
  } catch (e) {
    err = true;
  }
  return {
    err: err,
    text: text,
    status: status,
  };
});
