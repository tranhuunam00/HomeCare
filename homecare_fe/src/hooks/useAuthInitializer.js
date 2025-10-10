// src/hooks/useAuthInitializer.js
import { useEffect } from "react";
import storage from "../services/storage";
import { useGlobalAuth } from "../contexts/AuthContext";
import API_CALL from "../services/axiosClient";
import useToast from "./useToast";

const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

const useAuthInitializer = () => {
  const {
    user,
    doctor,
    handleLoginContext,
    handleLogoutGlobal,
    setExamParts,
    setTemplateServices,
    setFormVer2Names,
    setUserPackages,
    setPrintTemplateGlobal,
  } = useGlobalAuth();
  const { showWarning } = useToast();

  useEffect(() => {
    const token = storage.get("TOKEN");
    const user = storage.get("USER");

    if (token && user?.id) {
      // Profile
      fetchWithRetry(() => API_CALL.get(`/users/profile/${user.id}`))
        .then((res) => {
          const { user, doctor } = res.data.data;
          handleLoginContext({ token, user, doctor });
        })
        .catch(() => {
          handleLogoutGlobal();
          showWarning("Vui lòng đăng nhập lại");
        });

      // Template Services
      fetchWithRetry(() =>
        API_CALL.get(`/ts`, { params: { page: 1, limit: 1000 } })
      )
        .then((res) => {
          setTemplateServices(res.data.data.data);
        })
        .catch(() => {
          showWarning("Không thể tải danh sách phân hệ");
        });

      // Exam Parts
      fetchWithRetry(() =>
        API_CALL.get(`/ts/exam-parts`, { params: { page: 1, limit: 1000 } })
      )
        .then((res) => {
          setExamParts(res.data.data.data);
        })
        .catch(() => {
          showWarning("Không thể tải danh sách bộ phận thăm khám");
        });

      // Form Ver2 Names
      fetchWithRetry(() =>
        API_CALL.get(`/form-ver2-names`, { params: { page: 1, limit: 5000 } })
      )
        .then((res) => {
          setFormVer2Names(res.data?.data.items);
        })
        .catch(() => {
          showWarning("Không thể tải danh sách form ver2");
        });
    }
  }, []);
  useEffect(() => {
    if (user?.id)
      fetchWithRetry(() =>
        API_CALL.get(`/package/user-package`, {
          params: { page: 1, limit: 2000, id_user: user?.id },
        })
      )
        .then((res) => {
          setUserPackages(res.data?.data.data);
        })
        .catch(() => {
          showWarning("Không thể tải setUserPackages");
        });
  }, [user?.id]);

  useEffect(() => {
    if (user?.id)
      fetchWithRetry(() =>
        API_CALL.get(`/print-template`, {
          params: { id_clinic: doctor?.id_clinic },
        })
      )
        .then((res) => {
          setPrintTemplateGlobal(res.data?.data.data);
        })
        .catch(() => {
          showWarning("Không thể tải setUserPackages");
        });
  }, [doctor?.id_clinic]);
};

export default useAuthInitializer;
