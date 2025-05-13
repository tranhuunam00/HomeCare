import React, { useState } from "react";
import { Typography, Row, Col, Table, Button } from "antd";

const { Title } = Typography;

const GuildLine = ({ title }) => {
  const [image1, setImage1] = useState("/liver-segments.jpg");
  const [image2, setImage2] = useState("/recist-chart.jpg");

  const handleImageChange = (e, setImage) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const renderImageBox = (imageSrc, setImage) => (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          width: "100%",
          height: "250px",
          border: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}
      >
        <img
          src={imageSrc}
          alt="Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <input
        className="no-print"
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, setImage)}
        style={{ marginTop: 8 }}
      />
    </div>
  );

  const columns = [
    {
      title: "Thuật ngữ & Viết tắt",
      dataIndex: "termGroup",
      width: "35%",
    },
    {
      title: "Ý nghĩa",
      dataIndex: "meaning",
      width: "65%",
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>{renderImageBox(image1, setImage1)}</Col>
        <Col span={12}>{renderImageBox(image2, setImage2)}</Col>
      </Row>

      <Title level={4} style={{ textAlign: "center", marginBottom: 20 }}>
        {title}
      </Title>

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

const abbreviations = [
  {
    key: "NE",
    termGroup: "NE - Not Evaluate",
    meaning: "Không đánh giá được",
  },
  {
    key: "NA",
    termGroup: "NA - Not Available",
    meaning: "Không đánh giá",
  },
  {
    key: "TP",
    termGroup: "TP - Time Point",
    meaning: "Thời điểm theo dõi sau điều trị",
  },
  {
    key: "BL",
    termGroup: "BL - Baseline",
    meaning: "Trước điều trị",
  },
  {
    key: "SLD",
    termGroup: "SLD - Sum of Longest Diameter",
    meaning: "Tổng kích thước của các tổn thương trục dài",
  },
  {
    key: "BLD",
    termGroup: "BLD - Baseline Sum Diameter",
    meaning: "Tổng kích thước của các tổn thương ở thời điểm Baseline",
  },
  {
    key: "SPD",
    termGroup: "SPD - Sum of perpendicular diameter",
    meaning: "Tổng kích thước trục ngắn",
  },
  {
    key: "Nadir",
    termGroup: "Nadir",
    meaning: "Giá trị SLD nhỏ nhất tại thời điểm đánh giá",
  },
  {
    key: "TL",
    termGroup: "TL - Target Lesions",
    meaning: "Tổn thương đích",
  },
  {
    key: "NTL",
    termGroup: "NTL - None Target Lesions",
    meaning: "Tổn thương ngoài đích",
  },
  {
    key: "CR",
    termGroup: "CR - Complete Response",
    meaning:
      "Bệnh thoái triển hoàn toàn: không còn thấy (< 10mm đối với hạch) và không có tổn thương mới",
  },
  {
    key: "PR",
    termGroup: "PR - Partial Response",
    meaning:
      "Bệnh thoái triển một phần: SLD giảm tối thiểu 30% so với BLD và không có tổn thương mới",
  },
  {
    key: "PD",
    termGroup: "PD - Progressive Disease",
    meaning:
      "Bệnh tiến triển: có tổn thương mới hoặc SLD tăng tối thiểu 20% (hoặc 5mm) so với NADIR",
  },
  {
    key: "SD",
    termGroup: "SD - Stable Disease",
    meaning: "Bệnh ổn định: không đủ tiêu chuẩn của PR và PD",
  },
];
