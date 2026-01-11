import { useCallback, useRef } from "react";
import API_CALL from "../services/axiosClient";
import { fetchWithRetry } from "./useAuthInitializer";
import { useGlobalAuth } from "../contexts/AuthContext";
import useToast from "./useToast";

const useTemplateServicesAndExamParts = () => {
  const { templateServices, examParts, setTemplateServices, setExamParts } =
    useGlobalAuth();

  const { showWarning } = useToast();
  const fetchingRef = useRef(false);

  const fetchTSAndExamParts = useCallback(
    async ({ force = false } = {}) => {
      //  CHECK NGAY TRONG HOOK
      if (!force && templateServices?.length > 0 && examParts?.length > 0) {
        return;
      }

      //  ĐANG FETCH → KHÔNG FETCH TRÙNG
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const [tsRes, examPartsRes] = await Promise.all([
          fetchWithRetry(() =>
            API_CALL.get("/ts", { params: { page: 1, limit: 1000 } })
          ),
          fetchWithRetry(() =>
            API_CALL.get("/ts/exam-parts", {
              params: { page: 1, limit: 1000 },
            })
          ),
        ]);

        setTemplateServices(tsRes.data?.data?.data || []);
        setExamParts(examPartsRes.data?.data?.data || []);
      } catch (error) {
        showWarning("Không thể tải dữ liệu phân hệ / bộ phận thăm khám");
      } finally {
        fetchingRef.current = false;
      }
    },
    [
      templateServices,
      examParts,
      setTemplateServices,
      setExamParts,
      showWarning,
    ]
  );

  return {
    fetchTSAndExamParts,
  };
};

export default useTemplateServicesAndExamParts;
