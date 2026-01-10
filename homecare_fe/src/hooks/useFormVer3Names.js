import { useCallback, useEffect, useState } from "react";
import API_CALL from "../services/axiosClient";

export const useFormVer3Names = ({
  filter = {},
  page = 1,
  limit = 1000,
  autoFetch = true,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFormVer3Names = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API_CALL.get("/formVer3_name", {
        params: {
          ...filter,
          page,
          limit,
        },
      });
      console.log("res?.data?", res?.data.data);
      setData(res?.data?.data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Fetch formVer3_name failed");
      console.error("Fetch formVer3_name failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, page, limit]);

  useEffect(() => {
    if (autoFetch) fetchFormVer3Names();
  }, [fetchFormVer3Names, autoFetch]);

  return {
    formVer3Names: data,
    loading,
    error,
    refetch: fetchFormVer3Names,
  };
};
