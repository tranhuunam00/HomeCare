import { Navigate } from "react-router-dom";
import STORAGE from "./services/storage";
import { useGlobalAuth } from "./contexts/AuthContext";
import { USER_ROLE } from "./constant/app";

const ProtectedRoute = ({ children }) => {
  const token = STORAGE.get("TOKEN");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Màn quản trị (mẫu kết quả, dịch vụ khám, danh sách bác sĩ, liên hệ...).
 * Menu chỉ ẩn mục; trước đây bác sĩ gõ thẳng URL (/home/customers...) vẫn mở được màn admin.
 * Server vẫn là nơi chặn quyền thật - đây là lớp chặn giao diện.
 */
export const AdminRoute = ({ children }) => {
  const { user } = useGlobalAuth();
  const token = STORAGE.get("TOKEN");
  if (!token) return <Navigate to="/" replace />;
  if (Number(user?.id_role) !== USER_ROLE.ADMIN) {
    return <Navigate to="/home/patients-diagnose" replace />;
  }
  return children;
};

export default ProtectedRoute;
