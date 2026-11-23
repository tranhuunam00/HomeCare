import { describe, it, expect } from "vitest";
import { freeTextToImagingRows, parseImageDescriptionState, toEditableImagingState } from "../doctor_use_formver3/doctorUseFormVer3.utils";

describe("freeTextToImagingRows (phiếu free-text D-SONO -> bảng cấu trúc HomeCare)", () => {
  it("tách 'Cơ quan: mô tả' thành từng dòng, không tự tick trạng thái", () => {
    const rows = freeTextToImagingRows(
      "<p>Gan: kích thước bình thường.<br/>Túi mật: không sỏi.<br/>Thận hai bên: không ứ nước.</p>"
    );
    expect(rows).toEqual([
      { id: 1, name: "Gan", status: "", description: "kích thước bình thường." },
      { id: 2, name: "Túi mật", status: "", description: "không sỏi." },
      { id: 3, name: "Thận hai bên", status: "", description: "không ứ nước." },
    ]);
  });

  it("dòng không có tên cơ quan -> dòng 'Mô tả' / nối vào dòng trước", () => {
    expect(freeTextToImagingRows("<p>• Không thấy bất thường<br/>thêm dòng</p>")).toEqual([
      { id: 1, name: "Mô tả", status: "", description: "Không thấy bất thường\nthêm dòng" },
    ]);
    expect(freeTextToImagingRows("Gan: to<br/>bờ đều")[0].description).toBe("to\nbờ đều");
  });

  it("rỗng -> []", () => {
    expect(freeTextToImagingRows("")).toEqual([]);
    expect(freeTextToImagingRows(null)).toEqual([]);
  });
});

describe("toEditableImagingState (nạp phiếu & Hoàn tác dùng chung)", () => {
  it("phiếu free-text -> bảng cấu trúc với các dòng tách từ văn bản, KHÔNG bật isFreeText", () => {
    const state = toEditableImagingState(
      parseImageDescriptionState(JSON.stringify({ isFreeText: true, text: "<p>Gan: bình thường<br/>Lách: không to</p>" }))
    );
    expect(state.mode).toBe("STRUCTURED_TABLE");
    expect(state.isFreeText).toBe(false);
    expect(state.rows.map((r) => r.name)).toEqual(["Gan", "Lách"]);
    expect(state.content).toContain("Gan: bình thường");
  });

  it("phiếu free-text rỗng -> dòng mặc định", () => {
    const parsed = parseImageDescriptionState(JSON.stringify({ isFreeText: true, text: "" }));
    expect(toEditableImagingState(parsed).rows).toBe(parsed.rows);
  });

  it("phiếu đã có cấu trúc -> giữ nguyên các dòng", () => {
    const rows = [{ id: 1, name: "Gan", status: "normal", description: "x" }];
    const state = toEditableImagingState(parseImageDescriptionState(JSON.stringify(rows)));
    expect(state.rows).toEqual(rows);
    expect(state.isFreeText).toBe(false);
  });

  it("đầu vào null không lỗi", () => {
    expect(toEditableImagingState(null).mode).toBe("STRUCTURED_TABLE");
  });
});
