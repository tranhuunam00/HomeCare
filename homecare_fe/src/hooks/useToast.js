// hooks/useToast.js
import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored", // hoặc "dark", "light"
  style: {
    fontSize: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "12px 16px",
  },
  icon: true, // có thể custom bằng function nếu muốn icon riêng
};

const useToast = () => {
  const showSuccess = (msg) => {
    toast.success(msg || "Thành công!", defaultOptions);
  };

  const showError = (msg) => {
    toast.error(msg || "Có lỗi xảy ra!", defaultOptions);
  };

  const showInfo = (msg) => {
    toast.info(msg || "Thông tin", defaultOptions);
  };

  const showWarning = (msg) => {
    toast.warn(msg || "Cảnh báo!", defaultOptions);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default useToast;
