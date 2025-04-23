import React, { useState } from "react";
import { Typography, Table, Input } from "antd";

const { Title } = Typography;

const ExaminationResults = () => {
  // State để lưu trữ dữ liệu có thể chỉnh sửa
  const [examResults, setExamResults] = useState([
    {
      organ: "Gan phải",
      description: "Không thấy hình ảnh bất thường",
      key: "1",
    },
    {
      organ: "Gan trái",
      description: "Không thấy hình ảnh bất thường",
      key: "2",
    },
    {
      organ: "Tĩnh mạch cửa",
      description: "Không thấy hình ảnh bất thường",
      key: "3",
    },
    {
      organ: "Tĩnh mạch gan",
      description: "Không thấy hình ảnh bất thường",
      key: "4",
    },
    {
      organ: "Động mạch gan",
      description: "Không thấy hình ảnh bất thường",
      key: "5",
    },
    {
      organ: "Đường mật trong gan",
      description: "Không thấy hình ảnh bất thường",
      key: "6",
    },
    {
      organ: "Đường mật ngoài gan",
      description: "Không thấy hình ảnh bất thường",
      key: "7",
    },
    {
      organ: "Túi mật",
      description: "Không thấy hình ảnh bất thường",
      key: "8",
    },
    { organ: "Lách", description: "Không thấy hình ảnh bất thường", key: "9" },
    { organ: "Tụy", description: "Không thấy hình ảnh bất thường", key: "10" },
    {
      organ: "Tuyến thượng thận phải",
      description: "Không thấy hình ảnh bất thường",
      key: "11",
    },
    {
      organ: "Tuyến thượng thận trái",
      description: "Không thấy hình ảnh bất thường",
      key: "12",
    },
    {
      organ: "Thận – niệu quản phải",
      description: "Không thấy hình ảnh bất thường",
      key: "13",
    },
    {
      organ: "Thận – niệu quản trái",
      description: "Không thấy hình ảnh bất thường",
      key: "14",
    },
    {
      organ: "Bàng quang",
      description: "Không thấy hình ảnh bất thường",
      key: "15",
    },
    {
      organ: "Dạ dày",
      description: "Không thấy hình ảnh bất thường",
      key: "16",
    },
    {
      organ: "Ruột non",
      description: "Không thấy hình ảnh bất thường",
      key: "17",
    },
    {
      organ: "Đại tràng",
      description: "Không thấy hình ảnh bất thường",
      key: "18",
    },
    {
      organ: "Phúc mạc",
      description: "Không thấy hình ảnh bất thường",
      key: "19",
    },
    {
      organ: "Sau phúc mạc",
      description: "Không thấy hình ảnh bất thường",
      key: "20",
    },
    {
      organ: "Dịch ổ bụng",
      description: "Không thấy hình ảnh bất thường",
      key: "21",
    },
    { organ: "Khác", description: "", key: "22" },
  ]);

  const columns = [
    {
      title: "Tổn thương",
      dataIndex: "organ",
      key: "organ",
      width: "200px",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => {
            const newData = [...examResults];
            newData[index].description = e.target.value;
            setExamResults(newData);
          }}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="Nhập mô tả chi tiết..."
        />
      ),
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
    <div style={{ padding: 24 }}>
      <style>
        {Object.entries(customTableStyles)
          .map(([selector, styles]) => {
            return `${selector} ${JSON.stringify(styles)}`
              .replace(/","/g, ";")
              .replace(/[{}"]/g, "");
          })
          .join("\n")}
      </style>

      <Title
        level={4}
        style={{ marginBottom: 16, color: "#1890ff", textAlign: "left" }}
      >
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
