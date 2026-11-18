import { describe, it, expect, vi } from "vitest";

vi.mock("../services/axiosClient", () => ({ default: {} }));
vi.mock("../contexts/AuthContext", () => ({ useGlobalAuth: () => ({}) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { getReopenTargetStatus } from "./usePatientDiagnoseStatus";

describe("getReopenTargetStatus (Sửa đọc)", () => {
  it("Đọc xong (4) -> chuyển về Đang đọc (3)", () => {
    expect(getReopenTargetStatus(4)).toBe(3);
    expect(getReopenTargetStatus("4")).toBe(3);
  });
  it("Đang đọc (3) -> không cần chuyển, chỉ mở form", () => {
    expect(getReopenTargetStatus(3)).toBeNull();
  });
  it("trạng thái khác / rỗng -> không chuyển", () => {
    for (const s of [1, 2, 5, 6, null, undefined, ""]) expect(getReopenTargetStatus(s)).toBeNull();
  });
});
