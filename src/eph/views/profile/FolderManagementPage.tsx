import { Button, Center } from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { _ } from "common/utils/arrays";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { historyStore } from "eph/renderer/history";
import { observer } from "mobx-react-lite";
import { FaWrench } from "react-icons/fa";
import { MdAdd, MdRemove } from "react-icons/md";

const FolderManagementPage = (): JSX.Element => {
  const folders = configStore.profileFolders;

  return (
    <div className="flex flex-col eph-h-full px-6 py-4">
      <div className="flex-grow overflow-y-auto">
        {folders.length === 0 ? (
          <Center className="text-shallow">
            There are no folders yet. Click the button at the right-bottom
            corner to create one.
          </Center>
        ) : (
          folders.map((value, index) => (
            <div key={index} className="bg-card rounded-lg p-5 m-5">
              <div className="text-lg font-medium">{value.nickname}</div>
              <div className="text-shallow">{value.pathname}</div>
              <div className="flex">
                <Button>
                  <FaWrench /> Configure
                </Button>
                <Button
                  onClick={() =>
                    showOverlay({
                      type: "dialog",
                      title: t("warning"),
                      message: t("confirmRemoving"),
                      action: () =>
                        setConfig((cfg) => _.remove(cfg.profileFolders, value)),
                      cancellable: true,
                    })
                  }
                  className="text-danger"
                >
                  <MdRemove /> Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end items-center">
        <div
          className="bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white transition-colors rounded-full w-12 h-12 flex items-center shadow-md justify-center cursor-pointer"
          onClick={() => historyStore.push("folder.create")}
        >
          <MdAdd />
        </div>
      </div>
    </div>
  );
};

export default observer(FolderManagementPage);
