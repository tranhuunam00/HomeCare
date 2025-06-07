// src/hooks/useAuthInitializer.js
import { useEffect } from "react";
import storage from "../services/storage";
import { useGlobalAuth } from "../contexts/AuthContext";
import API_CALL from "../services/axiosClient";

const useAuthInitializer = () => {
  const { handleLoginContext, handleLogoutGlobal } = useGlobalAuth();

  useEffect(() => {
    const token = storage.get("TOKEN");
    const user = storage.get("USER");

    if (token && user?.id) {
      API_CALL.get(`/users/profile/${user.id}`)
        .then((res) => {
          const { user, doctor } = res.data.data;
          handleLoginContext({ token, user, doctor }); // ✅ xác thực thành công
        })
        .catch(() => {
          handleLogoutGlobal(); // ❌ token hết hạn hoặc không hợp lệ
        });
    }
  }, []);
};

export default useAuthInitializer;
