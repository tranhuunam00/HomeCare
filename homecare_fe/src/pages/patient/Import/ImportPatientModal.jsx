import React, { useState } from "react";
import { Modal, Space, Button, Upload, message } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import provinces from "../../../dataJson/full_json_generated_data_vn_units.json";

const { Dragger } = Upload;

const ImportPatientModal = ({ open, onClose }) => {
  const [importFile, setImportFile] = useState(null);

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
    .map((e) => `(${e.template_service?.name || ""}) ${e.name}`)
    .sort();

  /* -------------------- DOWNLOAD TEMPLATE -------------------- */

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("IMPORT");
    const dataSheet = workbook.addWorksheet("DATA");

    /* TITLE */

    sheet.mergeCells("A1:N1");

    const title = sheet.getCell("A1");

    title.value = "D-RAD IMPORT CA BỆNH";

    title.font = {
      bold: true,
      size: 24,
      color: { argb: "FF0070C0" },
    };

    title.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    /* INTRO */

    sheet.getCell("A3").value = "Giới thiệu";
    sheet.getCell("A3").font = { bold: true };

    sheet.getCell("A4").value =
      "File Excel này dùng để import ca bệnh vào hệ thống D-RAD.";

    sheet.getCell("A5").value =
      "Không thay đổi tên cột và chỉ nhập giá trị hợp lệ.";

    /* HEADER */

    const headers = [
      "PID *",
      "SID *",
      "Họ và tên *",
      "Giới tính *",
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

    const headerRowIndex = 7;

    const headerRow = sheet.getRow(headerRowIndex);

    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);

      cell.value = h;

      cell.font = { bold: true };

      cell.alignment = { horizontal: "center" };
    });

    headerRow.commit();

    /* COLUMN WIDTH */

    sheet.columns = [
      { width: 12 },
      { width: 12 },
      { width: 22 },
      { width: 12 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
      { width: 24 },
      { width: 24 },
      { width: 22 },
      { width: 20 },
      { width: 18 },
      { width: 20 },
      { width: 28 },
    ];

    /* -------------------- DATA SHEET -------------------- */

    /* GENDER */

    dataSheet.getCell("A1").value = "Nam";
    dataSheet.getCell("A2").value = "Nữ";

    /* TEMPLATE SERVICE */

    templateNames.forEach((t, i) => {
      dataSheet.getCell(`B${i + 1}`).value = t;
    });

    /* EXAM PART */

    examPartList.forEach((e, i) => {
      dataSheet.getCell(`C${i + 1}`).value = e;
    });

    /* PROVINCE */

    provinceNames.forEach((p, i) => {
      dataSheet.getCell(`D${i + 1}`).value = p;
    });

    /* WARD */

    wardList.forEach((w, i) => {
      dataSheet.getCell(`E${i + 1}`).value = w;
    });

    /* -------------------- VALIDATION -------------------- */

    const startRow = headerRowIndex + 1;

    const endRow = 500;

    for (let r = startRow; r <= endRow; r++) {
      /* GENDER */

      sheet.getCell(`D${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["DATA!$A$1:$A$2"],
      };

      /* PROVINCE */

      sheet.getCell(`K${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`DATA!$D$1:$D$${provinceNames.length}`],
      };

      /* WARD */

      sheet.getCell(`L${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`DATA!$E$1:$E$${wardList.length}`],
      };

      /* TEMPLATE SERVICE */

      sheet.getCell(`M${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`DATA!$B$1:$B$${templateNames.length}`],
      };

      /* EXAM PART */

      sheet.getCell(`N${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`DATA!$C$1:$C$${examPartList.length}`],
      };
    }

    /* -------------------- EXAMPLE -------------------- */

    const exampleRow = sheet.getRow(startRow);

    exampleRow.getCell(1).value = "BN001";
    exampleRow.getCell(2).value = "SID001";
    exampleRow.getCell(3).value = "Nguyễn Văn A";
    exampleRow.getCell(4).value = "Nam";
    exampleRow.getCell(5).value = "1990-01-01";
    exampleRow.getCell(6).value = "0912345678";
    exampleRow.getCell(9).value = "Đau bụng";
    exampleRow.getCell(10).value = "Hà Nội";
    exampleRow.getCell(11).value = "Hà Nội";
    exampleRow.getCell(12).value = "(Hà Nội) Ba Đình";
    exampleRow.getCell(13).value = templateNames?.[0] || "";
    exampleRow.getCell(14).value = examPartList?.[0] || "";

    exampleRow.commit();

    /* -------------------- EXPORT -------------------- */

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "drad-import-template.xlsx");
  };

  /* -------------------- CHECK IMPORT -------------------- */

  const handleCheck = () => {
    if (!importFile) {
      message.warning("Vui lòng chọn file Excel");
      return;
    }

    console.log(importFile);
  };

  /* -------------------- UI -------------------- */

  return (
    <Modal
      title="Import ca bệnh"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
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
          Check dữ liệu
        </Button>
      </Space>
    </Modal>
  );
};

export default ImportPatientModal;
