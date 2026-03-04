import React, { useState } from "react";
import { Modal, Space, Button, Upload, message } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useGlobalAuth } from "../../../contexts/AuthContext";

const { Dragger } = Upload;

const ImportPatientModal = ({ open, onClose }) => {
  const [importFile, setImportFile] = useState(null);

  const { templateServices = [], examParts = [] } = useGlobalAuth();

  const templateNames = templateServices.map((t) => t.name);

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("IMPORT");
    const dataSheet = workbook.addWorksheet("DATA");

    /* TITLE */

    sheet.mergeCells("A1:L1");

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
      "name *",
      "gender *",
      "dob",
      "phoneNumber",
      "CCCD",
      "email",
      "address",
      "Indication",
      "id_template_service",
      "id_exam_part",
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
    ];

    /* DATA SHEET */

    dataSheet.getCell("A1").value = "Gender";
    dataSheet.getCell("A2").value = "Nam";
    dataSheet.getCell("A3").value = "Nữ";

    const templateStart = 1;

    templateServices.forEach((t, i) => {
      dataSheet.getCell(`B${i + 1}`).value = t.id;
    });

    examParts.forEach((e, i) => {
      dataSheet.getCell(`C${i + 1}`).value = e.id;
    });

    /* VALIDATION */

    const startRow = headerRowIndex + 1;
    const endRow = 500;

    for (let r = startRow; r <= endRow; r++) {
      /* gender */

      sheet.getCell(`D${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["DATA!$A$2:$A$3"],
      };

      /* template service */

      for (let r = startRow; r <= endRow; r++) {
        sheet.getCell(`K${r}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${templateNames.join(",")}"`],
        };
      }
      /* exam part */

      for (let r = startRow; r <= endRow; r++) {
        sheet.getCell(`L${r}`).dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`INDIRECT(SUBSTITUTE($K${r}," ","_"))`],
        };
      }
    }

    /* EXAMPLE */

    const exampleRow = sheet.getRow(startRow);

    exampleRow.getCell(1).value = "BN001";
    exampleRow.getCell(2).value = "SID001";
    exampleRow.getCell(3).value = "Nguyễn Văn A";
    exampleRow.getCell(4).value = "Nam";
    exampleRow.getCell(5).value = "1990-01-01";
    exampleRow.getCell(6).value = "0912345678";
    exampleRow.getCell(9).value = "Hà Nội";
    exampleRow.getCell(10).value = "Đau bụng";
    exampleRow.getCell(11).value = templateServices?.[0]?.name || "";
    exampleRow.getCell(12).value = examParts?.[0]?.name || "";

    exampleRow.commit();

    /* EXPORT */

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "drad-import-template.xlsx");
  };

  const handleCheck = () => {
    if (!importFile) {
      message.warning("Vui lòng chọn file Excel");
      return;
    }

    console.log(importFile);
  };

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
