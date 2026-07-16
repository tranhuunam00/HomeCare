import { useState } from "react";
import { toast } from "react-toastify";
import API_CALL from "../services/axiosClient";
import { useGlobalAuth } from "../contexts/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// Module-level singleton guard – shared across ALL component instances.
// Prevents concurrent calls even when two components (e.g. FormActionBar +
// FormVer3GroupProcessPatientDiagnoise) each hold their own hook instance.
// ─────────────────────────────────────────────────────────────────────────────
let _inFlight = false;

export default function usePatientDiagnoseStatus() {
  const { setSelectedPatientDiagnose } = useGlobalAuth();
  const [transitioning, setTransitioning] = useState(false);

  const transitionStatus = async ({
    patientDiagnoseId,
    newStatus,
    successMessage = "Thao tác thành công",
    localSetState = null,
    onStatusChange = null,
    additionalPayload = {},
  }) => {
    // Đặt guard NGAY ĐẦU — shared giữa mọi instances của hook
    if (_inFlight) return false;
    _inFlight = true;

    try {
      setTransitioning(true);

      // Gọi API đổi trạng thái lên backend
      await API_CALL.post(`/patient-diagnose/${patientDiagnoseId}/change-status`, {
        status: newStatus,
        ...additionalPayload,
      });

      // 1. Đồng bộ Global Context
      setSelectedPatientDiagnose((prev) => {
        if (!prev || prev.id !== patientDiagnoseId) return prev;
        return { ...prev, status: newStatus };
      });

      // 2. Đồng bộ Local State
      if (localSetState) {
        localSetState((prev) => {
          if (!prev) return prev;
          return { ...prev, status: newStatus };
        });
      }

      // 3. Callback refresh list
      if (onStatusChange) {
        onStatusChange();
      }

      if (successMessage) {
        toast.success(successMessage);
      }
      return true;
    } catch (error) {
      console.error("[usePatientDiagnoseStatus] error", error);

      // Khi gặp lỗi transition, fetch lại trạng thái thực tế từ DB để sync UI
      try {
        const res = await API_CALL.get(`/patient-diagnose/${patientDiagnoseId}`);
        const freshData = res?.data?.data?.data || res?.data?.data || res?.data;

        if (freshData) {
          // Sync global context
          setSelectedPatientDiagnose((prev) => {
            if (!prev || prev.id !== patientDiagnoseId) return prev;
            return { ...prev, ...freshData };
          });
          // Sync local state
          if (localSetState) {
            localSetState(() => freshData);
          }

          // Nếu DB đã ở trạng thái đích (transition đã được thực hiện từ trước),
          // coi như thành công — không hiện error toast gây nhầm lẫn
          if (freshData.status === newStatus) {
            if (onStatusChange) onStatusChange();
            return true;
          }
        }
      } catch (refetchError) {
        console.warn("[usePatientDiagnoseStatus] refetch after error failed", refetchError);
      }

      // Chỉ hiện error toast nếu DB thực sự chưa đạt trạng thái mong muốn
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái",
      );
      return false;
    } finally {
      _inFlight = false;
      setTransitioning(false);
    }
  };

  return {
    transitionStatus,
    transitioning,
  };
}
