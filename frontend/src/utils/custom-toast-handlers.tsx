import { CSSProperties } from "react";
import toast, { ToastOptions } from "react-hot-toast";

const TOAST_STYLE: CSSProperties = {
  background: "rgb(64 64 64)", // neutral-700
  border: "1px solid rgb(82 82 82)", // neutral-600
  color: "#fff",
  borderRadius: "4px",
};

const TOAST_OPTIONS: ToastOptions = {
  position: "top-right",
  style: TOAST_STYLE,
};

export const displayErrorToast = (error: string) => {
  toast.error(error, TOAST_OPTIONS);
};

export const displaySuccessToast = (message: string) => {
  toast.success(message, TOAST_OPTIONS);
};
