import { describe, it, expect } from "vitest";
import {
  getOptionLabel,
  buildFormDataDoctorUseFormVer3,
  formatIndentedList,
  getServiceLabel,
  examPartName,
  calculateAge,
  generateTextFromStructuredRows,
} from "../formver3.constant";

describe("formver3.constant.js helpers", () => {
  describe("getOptionLabel", () => {
    const mockOptions = [
      { value: "opt1", label: "Label 1" },
      { value: "opt2", label: "Label 2" },
    ];

    it("phải trả về đúng label tương ứng với value", () => {
      expect(getOptionLabel(mockOptions, "opt1")).toBe("Label 1");
      expect(getOptionLabel(mockOptions, "opt2")).toBe("Label 2");
    });

    it("phải trả về chuỗi rỗng nếu không tìm thấy", () => {
      expect(getOptionLabel(mockOptions, "opt3")).toBe("");
      expect(getOptionLabel(undefined, "opt1")).toBe("");
    });
  });

  describe("formatIndentedList", () => {
    it("phải định dạng đúng danh sách và thụt đầu dòng", () => {
      const items = ["Hàng 1\nHàng 1.2", "Hàng 2"];
      const result = formatIndentedList(items);
      expect(result).toBe("1. Hàng 1\n   Hàng 1.2\n2. Hàng 2");
    });

    it("trả về chuỗi rỗng khi danh sách trống", () => {
      expect(formatIndentedList([])).toBe("");
    });
  });

  describe("getServiceLabel", () => {
    const mockService = { name: "Dịch vụ tiếng Việt", name_en: "English service name" };

    it("phải trả về tên tiếng Việt nếu languageTranslate là vi", () => {
      expect(getServiceLabel(mockService, "vi")).toBe("Dịch vụ tiếng Việt");
    });

    it("phải trả về tên tiếng Anh nếu languageTranslate là en", () => {
      expect(getServiceLabel(mockService, "en")).toBe("English service name");
    });

    it("fallback sang name nếu name_en không tồn tại khi chọn en", () => {
      const mockServiceNoEn = { name: "Chỉ có tiếng Việt" };
      expect(getServiceLabel(mockServiceNoEn, "en")).toBe("Chỉ có tiếng Việt");
    });
  });

  describe("examPartName", () => {
    const mockPart = { name: "Bộ phận tiếng Việt", name_en: "English part name" };

    it("phải trả về tên tiếng Việt khi ngôn ngữ là vi", () => {
      expect(examPartName(mockPart, "vi")).toBe("Bộ phận tiếng Việt");
    });

    it("phải trả về tên tiếng Anh khi ngôn ngữ là en", () => {
      expect(examPartName(mockPart, "en")).toBe("English part name");
    });

    it("fallback sang name nếu không có name_en khi chọn en", () => {
      const mockPartNoEn = { name: "Không tiếng Anh" };
      expect(examPartName(mockPartNoEn, "en")).toBe("Không tiếng Anh");
    });
  });

  describe("calculateAge", () => {
    it("phải tính tuổi dựa trên dob", () => {
      const currentYear = new Date().getFullYear();
      const dob = `${currentYear - 30}-05-15`; // 30 tuổi
      expect(calculateAge(dob, null)).toBe(30);
    });

    it("phải tính tuổi dựa trên birthYear nếu không có dob", () => {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - 45; // 45 tuổi
      expect(calculateAge(null, birthYear)).toBe(45);
    });

    it("trả về chuỗi rỗng nếu cả dob và birthYear đều không hợp lệ", () => {
      expect(calculateAge(null, null)).toBe("");
    });
  });

  describe("buildFormDataDoctorUseFormVer3", () => {
    const mockValues = {
      id_template_service: 10,
      id_exam_part: 20,
      id_print_template: 30,
      language: "vi",
      implementMethod: "Cách thức",
      contrastInjection: "no",
      imageQuatity: "good",
      additionalAction: "no",
      chan_doan_phan_biet: "Chẩn đoán phân biệt",
      phan_do_loai: "Bình thường",
      khuyen_nghi: "Khuyến nghị",
      icd10: "A00",
      imagingDiagnosisSummary: "Tóm tắt",
      benh_nhan_ho_ten: "Nguyễn Văn A",
      benh_nhan_gioi_tinh: "Nam",
      benh_nhan_tuoi: 35,
    };

    it("phải append đúng imageDescription dạng JSON khi có imageDescriptionJson", () => {
      const extra = {
        id_patient_diagnose: 99,
        imageDescriptionJson: JSON.stringify({ isFreeText: true, text: "<p>Content</p>" }),
      };

      const fd = buildFormDataDoctorUseFormVer3(mockValues, extra);
      expect(fd.get("imageDescription")).toBe(extra.imageDescriptionJson);
      expect(fd.get("id_patient_diagnose")).toBe("99");
      expect(fd.get("benh_nhan_ho_ten")).toBe("Nguyễn Văn A");
      expect(fd.get("language")).toBe("vi");
    });

    it("phải serialize imagingRows thành JSON khi không có imageDescriptionJson", () => {
      const mockRows = [{ id: 1, name: "Gan", status: "normal" }];
      const extra = {
        imagingRows: mockRows,
      };

      const fd = buildFormDataDoctorUseFormVer3(mockValues, extra);
      expect(fd.get("imageDescription")).toBe(JSON.stringify(mockRows));
    });

    it("phải xử lý imageList và imageDescMeta đúng đắn", () => {
      const extra = {
        imageList: [
          { url: "http://image.com/1.jpg", caption: "Caption 1" },
          { file: { name: "test.png" }, caption: "Caption 2" },
        ],
      };

      const fd = buildFormDataDoctorUseFormVer3(mockValues, extra);
      const meta = JSON.parse(fd.get("imageDescMeta"));
      expect(meta).toHaveLength(2);
      expect(meta[0].url).toBe("http://image.com/1.jpg");
      expect(meta[0].isChange).toBeUndefined();
      expect(meta[1].url).toBe("");
      expect(meta[1].fileField).toBe("ImageDescFiles");
    });
  });

  describe("generateTextFromStructuredRows", () => {
    it("phải chuyển đổi chính xác các hàng có trạng thái bình thường và bất thường sang HTML tương ứng", () => {
      const mockRows = [
        { id: 1, name: "Gan", status: "normal" },
        { id: 2, name: "Tụy", status: "abnormal", description: "Kích thước to" },
      ];
      
      const resultVi = generateTextFromStructuredRows(mockRows, "vi");
      expect(resultVi).toContain("<table");
      expect(resultVi).toContain("Bộ phận thăm khám");
      expect(resultVi).toContain("Gan");
      expect(resultVi).toContain("✓");
      expect(resultVi).toContain("Kích thước to");

      const resultEn = generateTextFromStructuredRows(mockRows, "en");
      expect(resultEn).toContain("<table");
      expect(resultEn).toContain("Exam Part");
      expect(resultEn).toContain("Normal");
    });

    it("trả về chuỗi rỗng khi danh sách hàng trống hoặc null", () => {
      expect(generateTextFromStructuredRows([])).toBe("");
      expect(generateTextFromStructuredRows(null)).toBe("");
    });
  });
});
