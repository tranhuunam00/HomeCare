import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePatientDiagnoseStatus from "../usePatientDiagnoseStatus";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

// Mock dependencies
vi.mock("../../services/axiosClient", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("../../contexts/AuthContext", () => ({
  useGlobalAuth: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("usePatientDiagnoseStatus Custom Hook", () => {
  let mockSetSelectedPatientDiagnose;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetSelectedPatientDiagnose = vi.fn();
    useGlobalAuth.mockReturnValue({
      setSelectedPatientDiagnose: mockSetSelectedPatientDiagnose,
    });
  });

  it("phải gọi API_CALL.post và cập nhật state khi transitionStatus thành công", async () => {
    API_CALL.post.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => usePatientDiagnoseStatus());

    let success;
    await act(async () => {
      success = await result.current.transitionStatus({
        patientDiagnoseId: 101,
        newStatus: 3,
        successMessage: "Thành công!",
      });
    });

    expect(success).toBe(true);
    expect(API_CALL.post).toHaveBeenCalledWith("/patient-diagnose/101/change-status", {
      status: 3,
    });

    // Kiểm tra setSelectedPatientDiagnose được gọi
    expect(mockSetSelectedPatientDiagnose).toHaveBeenCalled();
    const updateFn = mockSetSelectedPatientDiagnose.mock.calls[0][0];
    const prev = { id: 101, status: 1 };
    expect(updateFn(prev)).toEqual({ id: 101, status: 3 });

    // Toast success
    expect(toast.success).toHaveBeenCalledWith("Thành công!");
  });

  it("không gọi API nếu người dùng hủy confirm dialog", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() => usePatientDiagnoseStatus());

    let success;
    await act(async () => {
      success = await result.current.transitionStatus({
        patientDiagnoseId: 101,
        newStatus: 3,
        confirmMessage: "Bạn chắc chứ?",
      });
    });

    expect(success).toBe(false);
    expect(API_CALL.post).not.toHaveBeenCalled();
    expect(mockSetSelectedPatientDiagnose).not.toHaveBeenCalled();
  });
});
