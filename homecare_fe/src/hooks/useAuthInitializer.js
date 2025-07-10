// src/hooks/useAuthInitializer.js
import { useEffect } from "react";
import storage from "../services/storage";
import { useGlobalAuth } from "../contexts/AuthContext";
import API_CALL from "../services/axiosClient";
import useToast from "./useToast";

const useAuthInitializer = () => {
  const {
    handleLoginContext,
    handleLogoutGlobal,
    setExamParts,
    setTemplateServices,
  } = useGlobalAuth();
  const { showWarning } = useToast();

  useEffect(() => {
    const token = storage.get("TOKEN");
    const user = storage.get("USER");

    if (token && user?.id) {
      API_CALL.get(`/users/profile/${user.id}`)
        .then((res) => {
          const { user, doctor } = res.data.data;
          handleLoginContext({ token, user, doctor });
        })
        .catch(() => {
          handleLogoutGlobal();
          showWarning("Vui lòng đăng nhập lại ");
        });

      API_CALL.get(`/ts`)
        .then((res) => {
          setTemplateServices(res.data.data.data);
        })
        .catch(() => {
          showWarning("Vui lòng  API_CALL.get(`/users/ts`)");
        });

      API_CALL.get("/ts/exam-parts", { params: { page: 1, limit: 1000 } })
        .then((res) => {
          setExamParts(res.data.data);
        })
        .catch(() => {
          showWarning("Không thể tải danh sách bộ phận thăm khám");
        });
    }
  }, []);
};

export default useAuthInitializer;
