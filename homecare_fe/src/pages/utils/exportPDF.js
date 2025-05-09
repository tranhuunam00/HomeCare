import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportPDF({
  selector = ".print-section",
  fileName = "ketqua_recist.pdf",
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
    .image-gallery {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-before: auto !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    .image-gallery .gallery-title {
      margin-bottom: 8px !important;
      page-break-after: avoid !important;
    }
    .image-gallery .gallery-images {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 12px !important;
      page-break-inside: auto !important;
      break-inside: auto !important;
      margin-top: 0 !important;
      padding: 0 !important;
    }
    .image-gallery .image-container {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      height: 310px !important;
      min-height: 310px !important;
      max-height: 310px !important;
      width: 100% !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
    }
    .image-gallery .image-item {
      width: 100% !important;
      height: 250px !important;
      min-height: 250px !important;
      max-height: 250px !important;
      margin-bottom: 4px !important;
      flex-shrink: 0 !important;
    }
    .image-gallery .image-caption {
      width: 100% !important;
      flex: 1 0 auto !important;
    }
    .image-gallery .image-caption textarea {
      font-size: 12px !important;
      height: 48px !important;
      min-height: 36px !important;
      max-height: 60px !important;
      padding: 2px 4px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .image-gallery img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }

  `;

  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;
  document.head.appendChild(styleTag);

  // Đợi một chút để đảm bảo các style đã được áp dụng
  await new Promise((resolve) => setTimeout(resolve, 1000));

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

export async function generatePDF() {
  // Lưu title cũ
  const oldTitle = document.title;
  // Đặt tên mới cho file PDF
  document.title = `RECIST_Report_${new Date()
    .toLocaleDateString("vi-VN")
    .replace(/\//g, "_")}`;

  // Thêm CSS cho in ấn
  const style = `
    @page {
      size: A4;
      margin: 15mm;
    }
    @media print {

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      /* Ẩn tất cả extension và thanh công cụ */
      #browser-extension-hide,
      #browser-action-hide,
      #page-action-hide,
      #nav-bar-hide,
      #toolbar-hide,
      #chrome-extension-hide,
      .chrome-extension,
      .browser-action,
      .page-action {
        display: none !important;
        visibility: hidden !important;
      }
      /* Ẩn tất cả nội dung khác */
      body * {
        visibility: hidden;
      }
      /* Chỉ hiển thị nội dung cần in */
      #report-container,
      #report-container *,
      .print-section,
      .print-section *,
      .tirads-container,
      .tirads-container * {
        visibility: visible !important;
      }
      #report-container,
      .tirads-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background-color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        margin: 0;
        padding: 15mm;
        box-sizing: border-box;
      }
      .no-print {
        display: none !important;
      }
      .print-section {
        page-break-inside: avoid;
        padding: 10px 0;
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
      .name_title {
        font-size: 16px;
        font-weight: bold;
      }
      .print-section-request {
        padding-top: 10px;
      }
      .tirads-categories-section {
        display: flex;
        flex-wrap: wrap;
        padding: 15px;
      }
      .tirads-categories-section .category {
        page-break-inside: avoid;
        break-inside: avoid;
        display: flex;
        flex-direction: column;
        margin-top: 16px; /* hoặc padding-top: 16px; */
      }
      .tirads-reference {
        border: none !important;
        margin-top: 16px;
      }
      .tirads-description {
        border: none !important;
        margin: 0;
      }
      .tirads-categories-section .category {
        font-size: 13px !important;
      }
      .tirads-categories-section .category-title {
        font-size: 15px !important;
      }
      .tirads-categories-section .option {
        font-size: 13px !important;
      }
      .tirads-categories-section .points {
        font-size: 12px !important;
      }
      .tirads-categories-section label {
        font-size: 13px !important;
        line-height: 1.2 !important;
      }
      .image-gallery {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-before: auto !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }
      .image-gallery .gallery-title {
        margin-bottom: 8px !important;
        page-break-after: avoid !important;
      }
      .image-gallery .gallery-images {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 12px !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
        margin-top: 0 !important;
        padding: 0 !important;
      }
      .image-gallery .image-container {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        height: 310px !important;
        min-height: 310px !important;
        max-height: 310px !important;
        width: 100% !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
      }
      .image-gallery .image-item {
        width: 100% !important;
        height: 250px !important;
        min-height: 250px !important;
        max-height: 250px !important;
        margin-bottom: 4px !important;
        flex-shrink: 0 !important;
      }
      .image-gallery .image-caption {
        width: 100% !important;
        flex: 1 0 auto !important;
      }
      .image-gallery .image-caption textarea {
        font-size: 12px !important;
        height: 48px !important;
        min-height: 36px !important;
        max-height: 60px !important;
        padding: 2px 4px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .image-gallery img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
    }
  `;

  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;
  document.head.appendChild(styleTag);

  // Đợi một chút để đảm bảo các style đã được áp dụng
  await new Promise((resolve) => setTimeout(resolve, 100));
  // Gọi hàm in của trình duyệt
  window.print();
  // Khôi phục lại title cũ
  document.title = oldTitle;

  // Xóa style sau khi in xong
  document.head.removeChild(styleTag);
}
