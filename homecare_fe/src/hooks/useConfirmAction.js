import { useState, useRef, useCallback } from "react";

/**
 * useConfirmAction – hook tiện ích dùng chung toàn hệ thống.
 *
 * Bọc bất kỳ tác vụ async nào với:
 *  - Hộp thoại xác nhận (dùng ConfirmActionModal)
 *  - Spinner loading trong nút OK
 *  - Toast thành công / thất bại từ react-toastify
 *
 * @example
 * const { confirmState, openConfirm } = useConfirmAction();
 *
 * // Trong JSX:
 * <ConfirmActionModal {...confirmState} />
 *
 * // Khi cần xác nhận:
 * openConfirm({
 *   title: "Xác nhận cập nhật",
 *   message: "Bạn có chắc chắn muốn cập nhật ca bệnh này không?",
 *   onConfirm: async () => {
 *     await API_CALL.put(`/patient-diagnose/${id}`, payload);
 *   },
 *   successMessage: "Cập nhật thành công!",
 *   errorMessage: "Cập nhật thất bại, vui lòng thử lại.",
 * });
 */

import { toast } from "react-toastify";

export default function useConfirmAction() {
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    loading: false,
    onConfirm: null,
    successMessage: null,
    errorMessage: null,
  });

  const openConfirm = useCallback(
    ({ title, message, onConfirm, successMessage, errorMessage }) => {
      setConfirmState({
        open: true,
        title,
        message,
        loading: false,
        successMessage,
        errorMessage,
        onConfirm: async () => {
          setConfirmState((prev) => ({ ...prev, loading: true }));
          try {
            await onConfirm();
            setConfirmState((prev) => ({
              ...prev,
              open: false,
              loading: false,
            }));
            if (successMessage) {
              toast.success(successMessage);
            }
          } catch (error) {
            setConfirmState((prev) => ({ ...prev, loading: false }));
            const msg =
              error?.response?.data?.message ||
              errorMessage ||
              "Thao tác thất bại, vui lòng thử lại.";
            toast.error(msg);
          }
        },
        onCancel: () =>
          setConfirmState((prev) => ({ ...prev, open: false, loading: false })),
      });
    },
    [],
  );

  return { confirmState, openConfirm };
}
