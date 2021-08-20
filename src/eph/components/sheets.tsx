import { DefaultFn } from "common/utils";
import { ReactNode } from "react";
import { MdArrowDownward } from "react-icons/md";
import { IconButton } from "./inputs";

export function BottomSheet(props: { children: ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex-grow" />
      {props.children}
    </>
  );
}

export function BottomSheetTitle({
  children,
  close,
}: {
  children: string;
  close: DefaultFn;
}): JSX.Element {
  return (
    <div className="flex items-center bg-card z-10 py-3 px-9 mb-3 shadow-sm top-0 sticky">
      <p className="font-semibold text-xl flex-grow">{children}</p>
      <IconButton onClick={close}>
        <MdArrowDownward />
      </IconButton>
    </div>
  );
}
