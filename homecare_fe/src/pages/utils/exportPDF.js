import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportPDF({
  selector = ".print-section",
  fileName = "ketqua_recist.pdf",
  type = "pdf", // "pdf" hoặc "print"
}) {
  // Thêm CSS cho in ấn
  const style = `
    .no-print {
      display: none !important;
    }
    .print-section {
      page-break-inside: avoid;
      margin-bottom: 20px;
    }
    table {
      page-break-inside: avoid;
    }
    .ant-table {
      page-break-inside: avoid;
    }
    .ant-table-tbody {
      page-break-inside: avoid;
    }
    .ant-table-row {
      page-break-inside: avoid;
    }
    /* Ẩn các form control không cần thiết khi in */
    .ant-form-item-control-input-content .ant-picker-suffix,
    .ant-form-item-control-input-content .ant-select-arrow,
    .ant-form-item-control-input-content .ant-input-number-handler-wrap {
      display: none !important;
    }
  `;

  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;
  document.head.appendChild(styleTag);

  // Đợi một chút để đảm bảo các style đã được áp dụng
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (type === "print") {
    window.print();
    document.head.removeChild(styleTag);
    return;
  }

  // Kiểu PDF như cũ
  const sections = document.querySelectorAll(selector);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 10;
  const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const canvas = await html2canvas(section, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1);
    const imgProperties = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProperties.height * imgWidth) / imgProperties.width;

    // Thêm nội dung vào trang
    pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

    // Thêm số trang
    const pageCount = pdf.internal.getNumberOfPages();
    for (let j = 1; j <= pageCount; j++) {
      pdf.setPage(j);
      pdf.setFontSize(10);
      pdf.setTextColor("#A9A9A9");
      pdf.text(
        `${j} / ${sections.length}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    if (i < sections.length - 1) {
      pdf.addPage();
    }
  }

  pdf.save(fileName);

  // Xóa bỏ style đã thêm
  document.head.removeChild(styleTag);
}
