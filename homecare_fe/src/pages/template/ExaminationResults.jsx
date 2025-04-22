import React from "react";
import { Typography, Table } from "antd";

const { Title } = Typography;

const ExaminationResults = () => {
  // Dữ liệu kết quả thăm khám
  const examResults = [
    { organ: "Gan phải", result: "Không thấy hình ảnh bất thường" },
    { organ: "Gan trái", result: "Không thấy hình ảnh bất thường" },
    { organ: "Tĩnh mạch cửa", result: "Không thấy hình ảnh bất thường" },
    { organ: "Tĩnh mạch gan", result: "Không thấy hình ảnh bất thường" },
    { organ: "Động mạch gan", result: "Không thấy hình ảnh bất thường" },
    { organ: "Đường mật trong gan", result: "Không thấy hình ảnh bất thường" },
    { organ: "Đường mật ngoài gan", result: "Không thấy hình ảnh bất thường" },
    { organ: "Túi mật", result: "Không thấy hình ảnh bất thường" },
    { organ: "Lách", result: "Không thấy hình ảnh bất thường" },
    { organ: "Tụy", result: "Không thấy hình ảnh bất thường" },
    {
      organ: "Tuyến thượng thận phải",
      result: "Không thấy hình ảnh bất thường",
    },
    {
      organ: "Tuyến thượng thận trái",
      result: "Không thấy hình ảnh bất thường",
    },
    {
      organ: "Thận - niệu quản phải",
      result: "Không thấy hình ảnh bất thường",
    },
    {
      organ: "Thận - niệu quản trái",
      result: "Không thấy hình ảnh bất thường",
    },
    { organ: "Bàng quang", result: "Không thấy hình ảnh bất thường" },
    { organ: "Dạ dày", result: "Không thấy hình ảnh bất thường" },
    { organ: "Ruột non", result: "Không thấy hình ảnh bất thường" },
    { organ: "Đại tràng", result: "Không thấy hình ảnh bất thường" },
    { organ: "Phúc mạc", result: "Không thấy hình ảnh bất thường" },
    { organ: "Sau phúc mạc", result: "Không thấy hình ảnh bất thường" },
    { organ: "Dịch ổ bụng", result: "Không thấy hình ảnh bất thường" },
    { organ: "Khác", result: "Không thấy hình ảnh bất thường" },
  ];

  const columns = [
    {
      title: "",
      dataIndex: "organ",
      width: "30%",
    },
    {
      title: "",
      dataIndex: "result",
      width: "70%",
    },
  ];

  const customTableStyles = {
    ".ant-table": {
      border: "none !important",
    },
    ".ant-table-container": {
      border: "none !important",
    },
    ".ant-table-cell": {
      borderRight: "none !important",
      borderLeft: "none !important",
      padding: "4px 8px !important",
    },
    ".ant-table-thead > tr > th": {
      borderTop: "none !important",
      borderLeft: "none !important",
      borderRight: "none !important",
      backgroundColor: "#f0f8ff",
      display: "none", // Ẩn header vì không cần thiết
    },
    ".ant-table-tbody > tr > td": {
      borderLeft: "none !important",
      borderRight: "none !important",
    },
    ".ant-table-tbody > tr:last-child > td": {
      borderBottom: "none !important",
    },
  };

  return (
    <div style={{ padding: 24 }} className="print-section">
      <style>
        {Object.entries(customTableStyles)
          .map(([selector, styles]) => {
            return `${selector} ${JSON.stringify(styles)}`
              .replace(/","/g, ";")
              .replace(/[{}"]/g, "");
          })
          .join("\n")}
      </style>

      <Title level={4} style={{ marginBottom: 16, color: "#1890ff" }}>
        KẾT QUẢ THĂM KHÁM GẦN NHẤT
      </Title>

      <Table
        columns={columns}
        dataSource={examResults}
        pagination={false}
        size="small"
        style={{ marginTop: 20 }}
        rowKey="organ"
        bordered={false}
      />
    </div>
  );
};

export default ExaminationResults;
