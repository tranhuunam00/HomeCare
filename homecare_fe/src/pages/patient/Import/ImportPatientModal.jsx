import React, { useState } from "react";
import { Modal, Space, Button, Upload, message } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import provinces from "../../../dataJson/full_json_generated_data_vn_units.json";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";
import ImportResult from "./ImportResult";

const { Dragger } = Upload;

const ImportPatientModal = ({ open, onClose, onImportSuccess }) => {
  const [importFile, setImportFile] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const importPatients = (rows) => {
    return API_CALL.post("/patient-diagnose/import", {
      rows,
    });
  };
  const handleCheck = async () => {
    if (!importFile) {
      message.warning("Vui lòng chọn file Excel");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await API_CALL.post(
        "/patient-diagnose/check-import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = res.data.data;

      if (data.invalidCount > 0) {
        toast.error(`Có ${data.invalidCount} dòng lỗi`);
      } else {
        toast.success(`Tất cả ${data.validCount} dòng hợp lệ`);
      }

      setCheckResult(data); //

      if (data.invalidCount > 0) {
        message.error(`Có ${data.invalidCount} dòng lỗi`);
        console.log("Invalid rows:", data.invalidRows);
      } else {
        message.success(`Tất cả ${data.validCount} dòng hợp lệ`);
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể kiểm tra dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!checkResult?.validRows?.length) {
      message.warning("Không có dữ liệu hợp lệ để import");
      return;
    }

    try {
      setLoading(true);

      const res = await importPatients(checkResult.validRows);

      message.success(`Đã tạo ${checkResult.validCount} ca bệnh`);

      const inserted = res.data?.data?.inserted || 0;

      toast.success(`Tạo thành công ${inserted} ca bệnh`);
      setCheckResult(null);
      setImportFile(null);
      if (onImportSuccess) {
        onImportSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Import thất bại");
    } finally {
      setLoading(false);
    }
  };
  const { templateServices = [], examParts = [] } = useGlobalAuth();

  /* -------------------- PROVINCE LIST -------------------- */

  const provinceNames = provinces.map((p) => p.Name);

  /* -------------------- WARD LIST -------------------- */

  const wardList = [];

  provinces.forEach((p) => {
    p.Wards.forEach((w) => {
      wardList.push(`(${p.Name}) ${w.Name}`);
    });
  });

  /* -------------------- TEMPLATE SERVICE LIST -------------------- */

  const templateNames = templateServices.map((t) => t.name);

  /* -------------------- EXAM PART LIST -------------------- */

  const examPartList = examParts
    .map((e) => {
      const template = templateServices.find(
        (t) => t.id == e.id_template_service,
      );

      return `(${template?.name || ""}) ${e.name}`;
    })
    .sort();

  /* -------------------- DOWNLOAD TEMPLATE -------------------- */

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("IMPORT");
    const dataSheet = workbook.addWorksheet("DATA");

    /* ---------------- TITLE ---------------- */

    sheet.mergeCells("A1:N1");

    const title = sheet.getCell("A1");

    title.value = "FILE MẪU IMPORT CA BỆNH VÀO HỆ THỐNG D-RAD";

    title.font = {
      bold: true,
      size: 20,
    };

    title.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    title.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFCE4D6" },
    };

    /* ---------------- GUIDE BOX ---------------- */

    sheet.mergeCells("A3:N6");

    const guide = sheet.getCell("A3");

    guide.value =
      "Hướng dẫn:\n" +
      "- Điền dữ liệu vào các cột tương ứng.\n" +
      "- Các cột có dấu (*) là bắt buộc.\n" +
      "- Không thay đổi tên cột.\n" +
      "- Chỉ nhập dữ liệu hợp lệ theo danh sách dropdown.";

    guide.alignment = {
      wrapText: true,
      vertical: "top",
    };

    guide.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF4B183" },
    };

    guide.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    guide.font = { size: 12 };

    /* ---------------- HEADER ---------------- */

    const headers = [
      "PID (*)",
      "SID (*)",
      "Họ và tên (*)",
      "Giới tính (*)",
      "Ngày sinh",
      "SDT",
      "CCCD",
      "Email",
      "Triệu chứng",
      "Địa chỉ",
      "Tỉnh/Thành phố",
      "Phường/Xã",
      "Phân hệ",
      "Bộ phận khám",
    ];

    const headerRowIndex = 8;

    const row = sheet.getRow(headerRowIndex);

    headers.forEach((h, i) => {
      const cell = row.getCell(i + 1);

      cell.value = h;

      cell.font = {
        bold: true,
        size: 12,
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      let color = "FFD9E1F2"; // default xanh nhạt

      // nhóm địa chỉ
      if (i >= 9 && i <= 11) {
        color = "FFE2F0D9"; // xanh lá nhạt
      }

      // nhóm phân hệ
      if (i >= 12 && i <= 13) {
        color = "FFFFF2CC"; // vàng nhạt
      }

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    row.commit();

    /* ---------------- COLUMN WIDTH ---------------- */

    sheet.columns = [
      { width: 12 },
      { width: 16 },
      { width: 26 },
      { width: 12 },
      { width: 14 },
      { width: 16 },
      { width: 18 },
      { width: 26 },
      { width: 24 },
      { width: 26 },
      { width: 20 },
      { width: 32 },
      { width: 40 },
      { width: 50 },
    ];

    /* ---------------- FREEZE HEADER ---------------- */

    sheet.views = [
      {
        state: "frozen",
        ySplit: headerRowIndex,
      },
    ];

    /* ---------------- DATA SHEET ---------------- */

    dataSheet.getCell("A1").value = "Nam";
    dataSheet.getCell("A2").value = "Nữ";

    templateNames.forEach((t, i) => {
      dataSheet.getCell(`B${i + 1}`).value = t;
    });

    examPartList.forEach((e, i) => {
      dataSheet.getCell(`C${i + 1}`).value = e;
    });

    provinceNames.forEach((p, i) => {
      dataSheet.getCell(`D${i + 1}`).value = p;
    });

    wardList.forEach((w, i) => {
      dataSheet.getCell(`E${i + 1}`).value = w;
    });

    /* ---------------- VALIDATION ---------------- */

    const startRow = headerRowIndex + 1;
    const endRow = 500;

    for (let r = startRow; r <= endRow; r++) {
      sheet.getCell(`B${r}`).value = {
        formula: `IF(A${r}="","",A${r}&"-"&TEXT(NOW(),"ddmmyy-hhmmss"))`,
      };
      sheet.getCell(`D${r}`).dataValidation = {
        type: "list",
        formulae: ["DATA!$A$1:$A$2"],
      };

      sheet.getCell(`K${r}`).dataValidation = {
        type: "list",
        formulae: [`DATA!$D$1:$D$${provinceNames.length}`],
      };

      sheet.getCell(`L${r}`).dataValidation = {
        type: "list",
        formulae: [`DATA!$E$1:$E$${wardList.length}`],
      };

      sheet.getCell(`M${r}`).dataValidation = {
        type: "list",
        formulae: [`DATA!$B$1:$B$${templateNames.length}`],
      };

      sheet.getCell(`N${r}`).dataValidation = {
        type: "list",
        formulae: [`DATA!$C$1:$C$${examPartList.length}`],
      };
    }

    /* -------------------- EXAMPLE -------------------- */

    const exampleRow = sheet.getRow(startRow);

    exampleRow.getCell(1).value = "BN001"; // PID
    // SID không cần set vì đã có formula ở cột B

    exampleRow.getCell(3).value = "Nguyễn Văn A";
    exampleRow.getCell(4).value = "Nam";
    exampleRow.getCell(5).value = "1990-01-01";
    exampleRow.getCell(6).value = "0912345678";
    exampleRow.getCell(7).value = "012345678901";
    exampleRow.getCell(8).value = "nguyenvana@gmail.com";
    exampleRow.getCell(9).value = "Đau bụng";
    exampleRow.getCell(10).value = "Số 1 Hoàng Hoa Thám";

    exampleRow.getCell(11).value = provinceNames?.[0] || "";
    exampleRow.getCell(12).value = wardList?.[0] || "";

    exampleRow.getCell(13).value = templateNames?.[0] || "";
    exampleRow.getCell(14).value = examPartList?.[0] || "";

    exampleRow.commit();

    /* ---------------- EXPORT ---------------- */

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "drad-import-template.xlsx");
  };

  return (
    <Modal
      title="Import ca bệnh"
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Button icon={<DownloadOutlined />} block onClick={downloadTemplate}>
          Tải mẫu Excel
        </Button>

        <Dragger
          beforeUpload={(file) => {
            setImportFile(file);
            return false;
          }}
          maxCount={1}
          accept=".xlsx,.xls"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>

          <p className="ant-upload-text">
            Kéo file Excel vào đây hoặc bấm để tải lên
          </p>

          <p style={{ fontSize: 12, color: "#999" }}>
            Chỉ hỗ trợ file .xlsx hoặc .xls
          </p>
        </Dragger>

        <Button
          type="primary"
          block
          disabled={!importFile}
          onClick={handleCheck}
        >
          Kiểm tra dữ liệu
        </Button>
        <ImportResult data={checkResult} />
        {checkResult && (
          <Button
            type="primary"
            block
            style={{ marginTop: 10 }}
            disabled={checkResult.validRows <= 0}
            onClick={handleImport}
          >
            Xác nhận tạo mới ({checkResult.validCount})
          </Button>
        )}
      </Space>
    </Modal>
  );
};

export default ImportPatientModal;
