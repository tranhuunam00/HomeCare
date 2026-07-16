import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DoctorIUseFormVer3 from "../doctor_use_formver3/use/DoctorIUseFormVer3";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useLatestDoctorUseFormVer3 from "../useLatestDoctorUseFormVer3";

// Mock matchMedia for Antd components
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {}
  };
};

// Mock subcomponents to avoid rendering their complex internal logic
vi.mock("../../../components/Suneditor/CustomSunEditor", () => ({
  default: ({ value, onChange, disabled }) => (
    <div data-testid="custom-sun-editor">
      <textarea
        data-testid="sun-editor-textarea"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("../components/AdvancedSampleSection", () => ({
  default: () => <div data-testid="advanced-sample-section">Mock AdvancedSampleSection</div>,
}));

vi.mock("../components/ImagingStructureTable3.jsx", () => ({
  default: () => <div data-testid="imaging-structure-table">Mock ImagingStructureTable</div>,
}));

vi.mock("../components/ImagingStructureTextTable.jsx", () => ({
  default: () => <div data-testid="imaging-structure-text-table">Mock ImagingStructureTextTable</div>,
}));

vi.mock("../components/ImagingDiagnosisSection", () => ({
  default: () => <div data-testid="imaging-diagnosis-section">Mock ImagingDiagnosisSection</div>,
}));

vi.mock("../components/PrintPreviewVer3NotDataDiagnose.jsx", () => ({
  default: () => <div data-testid="print-preview">Mock PrintPreview</div>,
}));

vi.mock("../../doctor_use_form_ver2/use/items/PatientInfoForm", () => ({
  default: () => <div data-testid="patient-info-form">Mock PatientInfoForm</div>,
}));

vi.mock("../../products/ImageWithCaptionInput/ImageWithCaptionInput", () => ({
  default: () => <div data-testid="image-with-caption-input">Mock ImageWithCaption</div>,
}));

// Mock routing hooks
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "123" }),
}));

// Mock axios / API client
vi.mock("../../../services/axiosClient", () => ({
  default: {
    get: vi.fn().mockImplementation((url) => {
      if (url.includes("/formVer3_name")) {
        return Promise.resolve({
          data: {
            data: {
              items: [],
            },
          },
        });
      }
      if (url.includes("/print-template")) {
        return Promise.resolve({
          data: {
            data: {
              data: [
                { id: 1, name: "Mẫu in A" },
                { id: 2, name: "Mẫu in B" },
              ],
            },
          },
        });
      }
      if (url.includes("/doctorUseFormVer3/detail/99")) {
        return Promise.resolve({
          data: {
            data: {
              data: {
                id: 99,
                id_template_service: 10,
                id_exam_part: 20,
                province_code: "1",
                ward_code: "1",
                imageDescription: JSON.stringify({ isFreeText: true, text: "<p>Nội dung mẫu tự do</p>" }),
              },
            },
          },
        });
      }
      return Promise.resolve({
        data: {
          data: {
            data: {
              id: 1,
              id_template_service: 10,
              id_exam_part: 20,
              province_code: "1",
              ward_code: "1",
              imageDescription: "[]",
            },
          },
        },
      });
    }),
    post: vi.fn(),
    postForm: vi.fn(),
  },
}));

// Mock contexts and custom hooks
vi.mock("../../../contexts/AuthContext", () => ({
  useGlobalAuth: vi.fn(),
}));

vi.mock("../useLatestDoctorUseFormVer3", () => ({
  default: vi.fn(),
}));

vi.mock("../../../hooks/useVietnamAddress", () => ({
  default: () => ({ provinces: [], wards: [], setSelectedProvince: vi.fn() }),
}));

vi.mock("../../../hooks/usePatientDiagnoseStatus", () => ({
  default: () => ({ transitionStatus: vi.fn() }),
}));

describe("DoctorIUseFormVer3 component", () => {
  const mockSelectedPatientDiagnose = {
    id: 1,
    name: "Nguyễn Văn A",
    status: 1,
    id_template_service: 10,
    id_exam_part: 20,
  };

  const mockContextValues = {
    examParts: [{ id: 20, name: "Gan", id_template_service: 10 }],
    templateServices: [{ id: 10, name: "Siêu âm" }],
    doctor: { id: 5, full_name: "Bác sĩ X" },
    setExamParts: vi.fn(),
    setTemplateServices: vi.fn(),
    selectedPatientDiagnose: mockSelectedPatientDiagnose,
    setSelectedPatientDiagnose: vi.fn(),
    previewOpen: false,
    setPreviewOpen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useGlobalAuth.mockReturnValue(mockContextValues);
    useLatestDoctorUseFormVer3.mockReturnValue({ record: null });
  });

  it("phải render đúng chế độ bảng cấu trúc mặc định", async () => {
    render(<DoctorIUseFormVer3 doctorUseFormVer3Id={null} />);

    // Chờ Switch hiển thị (sau khi kết thúc loading state)
    const switchElement = await screen.findByRole("switch");
    expect(switchElement).toBeDefined();

    const switchLabel = screen.getByText("Văn bản tự do");
    expect(switchLabel).toBeDefined();

    // Mặc định không ở chế độ free text, nên render ImagingStructureTable
    expect(screen.getByTestId("imaging-structure-table")).toBeDefined();
    expect(screen.queryByTestId("custom-sun-editor")).toBeNull();
  });

  it("phải hiển thị CustomSunEditor khi toggle Switch văn bản tự do", async () => {
    render(<DoctorIUseFormVer3 doctorUseFormVer3Id={null} />);

    const switchElement = await screen.findByRole("switch");
    expect(switchElement).toBeDefined();
    expect(switchElement.getAttribute("aria-checked")).toBe("false");

    // Click toggle Switch
    await act(async () => {
      fireEvent.click(switchElement);
    });

    expect(switchElement.getAttribute("aria-checked")).toBe("true");
    // Chế độ free text: render CustomSunEditor và ẩn ImagingStructureTable
    expect(screen.getByTestId("custom-sun-editor")).toBeDefined();
    expect(screen.queryByTestId("imaging-structure-table")).toBeNull();
  });

  it("phải tự động bật chế độ văn bản tự do nếu record load từ server ở dạng free text", async () => {
    // Mock record lấy từ useLatestDoctorUseFormVer3 ở chế độ free text
    const mockRecord = {
      id: 99,
      imageDescription: JSON.stringify({ isFreeText: true, text: "<p>Nội dung mẫu tự do</p>" }),
      id_patient_diagnose_patient_diagnose: mockSelectedPatientDiagnose,
    };
    useLatestDoctorUseFormVer3.mockReturnValue({ record: mockRecord });

    render(<DoctorIUseFormVer3 doctorUseFormVer3Id={99} />);

    // Chờ CustomSunEditor hiển thị
    const editor = await screen.findByTestId("custom-sun-editor");
    expect(editor).toBeDefined();

    // Editor textarea phải hiển thị đúng nội dung từ server và bị disabled
    const textarea = screen.getByTestId("sun-editor-textarea");
    expect(textarea.value).toBe("<p>Nội dung mẫu tự do</p>");
    expect(textarea.disabled).toBe(true);
  });
});
