// src/hooks/useAuthInitializer.js
import { useEffect, useState } from "react";
import storage from "../services/storage";
import { useGlobalAuth } from "../contexts/AuthContext";
import API_CALL from "../services/axiosClient";
import useToast from "./useToast";
import useTemplateServicesAndExamParts from "./useTemplateServicesAndExamParts";

/**
 * Retry helper
 */
export const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
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
    setFormVer2Names,
    setUserPackages,
    setPrintTemplateGlobal,
    setDoctors,
    setClinicsAll,
  } = useGlobalAuth();

  const { showWarning } = useToast();
  const { fetchTSAndExamParts } = useTemplateServicesAndExamParts();

  const token = storage.get("TOKEN");
  const storedUser = storage.get("USER");

  const isAuthenticated = !!token && !!storedUser?.id;
  const [authReady, setAuthReady] = useState(false);

  /**
   * 1️⃣ AUTH GATE – Fetch profile
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchWithRetry(() => API_CALL.get(`/users/profile/${storedUser.id}`))
      .then((res) => {
        const { user, doctor } = res.data.data;
        handleLoginContext({ token, user, doctor });
        setAuthReady(true);
      })
      .catch(() => {
        handleLogoutGlobal();
        showWarning("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      });
  }, [isAuthenticated]);

  /**
   * 2️⃣ Load static & global data (sau khi auth OK)
   */
  useEffect(() => {
    if (!authReady) return;

    // Template services & exam parts
    fetchTSAndExamParts();

    // Form ver2 names
    fetchWithRetry(() =>
      API_CALL.get(`/form-ver2-names`, {
        params: { page: 1, limit: 5000 },
      }),
    )
      .then((res) => {
        setFormVer2Names(res.data?.data.items || []);
      })
      .catch(() => {});

    // Clinics
    fetchWithRetry(() =>
      API_CALL.get(`/clinics`, {
        params: { page: 1, limit: 5000 },
      }),
    )
      .then((res) => {
        setClinicsAll(res.data?.data.data || []);
      })
      .catch(() => {});

    // Doctors (advisor)
    fetchWithRetry(() =>
      API_CALL.get(`/doctor`, {
        params: { page: 1, limit: 5000, is_advisor: true },
      }),
    )
      .then((res) => {
        setDoctors(res.data?.data.data || []);
      })
      .catch(() => {});
  }, [authReady]);

  /**
   * 3️⃣ User packages
   */
  useEffect(() => {
    if (!authReady || !user?.id) return;

    fetchWithRetry(() =>
      API_CALL.get(`/package/user-package`, {
        params: {
          page: 1,
          limit: 2000,
          id_user: user.id,
        },
      }),
    )
      .then((res) => {
        setUserPackages(res.data?.data.data || []);
      })
      .catch(() => {});
  }, [authReady, user?.id]);

  /**
   * 4️⃣ Print templates theo clinic
   */
  useEffect(() => {
    if (!authReady || !doctor?.id_clinic) return;

    fetchWithRetry(() =>
      API_CALL.get(`/print-template`, {
        params: { id_clinic: doctor.id_clinic },
      }),
    )
      .then((res) => {
        setPrintTemplateGlobal(res.data?.data.data || []);
      })
      .catch(() => {});
  }, [authReady, doctor?.id_clinic]);
};

export default useAuthInitializer;
