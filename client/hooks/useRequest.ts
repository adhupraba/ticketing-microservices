import { useState } from "react";
import axios from "axios";
import { ErrorField } from "@src/types";

type UseRequestParams = {
  url: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  body?: any;
  onSuccess?: (data: any) => void;
};

export const useRequest = ({ url, method, body, onSuccess }: UseRequestParams) => {
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    try {
      setLoading(true);

      let data: any;

      if (method === "get") {
        ({ data } = await axios[method](url, { withCredentials: true }));
      } else {
        ({ data } = await axios[method](url, body || {}, { withCredentials: true }));
      }

      if (onSuccess) {
        onSuccess(data);
      }

      setErrors([]);
      setLoading(false);
      return data;
    } catch (err: any) {
      setLoading(false);
      setErrors(err?.response?.data?.errors || [{ message: "Something went wrong" }]);
    }
  };

  return { sendRequest, errors, loading };
};
