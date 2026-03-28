import { toast } from "react-hot-toast";

export const handleError = (err, customMessage) => {
  console.error(err);

  const message =
    err?.response?.data?.message ||
    err?.message ||
    customMessage ||
    "Something went wrong";

  toast.error(message);
};