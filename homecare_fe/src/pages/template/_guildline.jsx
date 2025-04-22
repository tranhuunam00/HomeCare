// React component: GuildLine.js
import React from "react";
import { Typography, Row, Col } from "antd";
import { Table } from "antd";

const { Title } = Typography;

const abbreviations = [
  { key: "NE", term: "Not Evaluate", meaning: "Không đánh giá được" },
  { key: "NA", term: "Not Available", meaning: "Không đánh giá" },
  { key: "TP", term: "Time Point", meaning: "Thời điểm theo dõi sau điều trị" },
  { key: "BL", term: "Baseline", meaning: "Trước điều trị" },
  {
    key: "SLD",
    term: "Sum of Longest Diameter",
    meaning: "Tổng kích thước của các tổn thương trục dài",
  },
  {
    key: "BLD",
    term: "Baseline Sum Diameter",
    meaning: "Tổng kích thước của các tổn thương ở thời điểm Baseline",
  },
  {
    key: "SPD",
    term: "Sum of perpendicular diameter",
    meaning: "Tổng kích thước trục ngắn",
  },
  {
    key: "Nadir",
    term: "",
    meaning: "Giá trị SLD nhỏ nhất tại thời điểm đánh giá",
  },
  { key: "TL", term: "Target Lesions", meaning: "Tổn thương đích" },
  { key: "NTL", term: "None Target Lesions", meaning: "Tổn thương ngoài đích" },
  {
    key: "CR",
    term: "Complete Response",
    meaning:
      "Bệnh thoái triển hoàn toàn: không còn thấy (< 10mm đối với hạch) và không có tổn thương mới",
  },
  {
    key: "PR",
    term: "Partial Response",
    meaning:
      "Bệnh thoái triển một phần: SLD giảm tối thiểu 30% so với BLD và không có tổn thương mới",
  },
  {
    key: "PD",
    term: "Progressive Disease",
    meaning:
      "Bệnh tiến triển: có tổn thương mới hoặc SLD tăng tối thiểu 20% (hoặc 5mm) so với NADIR",
  },
  {
    key: "SD",
    term: "Stable Disease",
    meaning: "Bệnh ổn định: không đủ tiêu chuẩn của PR và PD",
  },
];

const GuildLine = ({ title }) => {
  const columns = [
    {
      title: "Viết tắt",
      dataIndex: "key",
      width: "15%",
    },
    {
      title: "Thuật ngữ tiếng Anh",
      dataIndex: "term",
      width: "25%",
    },
    {
      title: "Ý nghĩa",
      dataIndex: "meaning",
      width: "60%",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
        {title}
      </Title>

      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <img
            src="../../../public/liver-segments.jpg" // Đường dẫn đến hình ảnh gan
            alt="Phân thùy gan"
            style={{ width: "100%", height: "auto" }}
          />
        </Col>
        <Col span={12}>
          <img
            src="../../../public/recist-chart.jpg" // Đường dẫn đến biểu đồ RECIST
            alt="Biểu đồ RECIST"
            style={{ width: "100%", height: "auto" }}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={abbreviations}
        pagination={false}
        size="small"
        style={{ marginTop: 20 }}
        rowKey="key"
        bordered={false}
      />
    </div>
  );
};

export default GuildLine;
