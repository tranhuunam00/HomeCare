// React component: GuildLine.js
import React, { useState } from "react";
import {
  Table,
  Input,
  Typography,
  Row,
  Col,
  Upload,
  Button,
  Image,
} from "antd";

const { Title, Text } = Typography;
import { UploadOutlined } from "@ant-design/icons";
import ImageUploader from "./_UploadImage";

const terms = [
  { short: "NE", full: "Not Evaluate", noidung: "Không đánh giá được" },
  { short: "NA", full: "Not Available", noidung: "Không đánh giá" },
  {
    short: "TP",
    full: "Time Point",
    noidung: "Thời điểm theo dõi sau điều trị",
  },
  { short: "BL", full: "Baseline", noidung: "Trước điều trị" },
  {
    short: "SLD",
    full: "Sum of Longest Diameter",
    noidung: "Tổng kích thước của các tổn thương trục dài",
  },
  {
    short: "BLD",
    full: "Baseline Sum Diameter",
    noidung: "Tổng kích thước của các tổn thương ở thời điểm Baseline",
  },
  {
    short: "SPD",
    full: "Sum of Perpendicular Diameter",
    noidung: "Tổng kích thước trục ngắn",
  },
  {
    short: "Nadir",
    full: "Nadir",
    noidung: "Giá trị SLD nhỏ nhất trước thời điểm đánh giá",
  },
  { short: "TL", full: "Target Lesions", noidung: "Tổn thương đích" },
  {
    short: "NTL",
    full: "None Target Lesions",
    noidung: "Tổn thương không đích",
  },
  { short: "CR", full: "Complete Response", noidung: "Đáp ứng hoàn toàn" },
  { short: "PR", full: "Partial Response", noidung: "Đáp ứng một phần" },
  { short: "PD", full: "Progressive Disease", noidung: "Bệnh tiến triển" },
  { short: "SD", full: "Stable Disease", noidung: "Bệnh ổn định" },
];
const columns = [
  {
    title: "STT",
    dataIndex: "stt",
    render: (text, record, index) => {
      return record.stt;
    },
    width: 40, // px
  },

  {
    title: "Nội dung",
    dataIndex: "noidung",
    render: (text, record, index) => {
      return record.noidung;
    },
    width: 200, // px
  },

  // {
  //   title: "Nội dung",
  //   dataIndex: "noidung",
  //   render: (text, record, index) => (
  //     <Input.TextArea
  //       value={text}
  //       autoSize={{ minRows: 2, maxRows: 5 }}
  //       onChange={(e) => record.onChange(index, e.target.value)}
  //     />
  //   ),
  //   width: 200, // px
  // },
].flat();

const GuildLine = ({ title }) => {
  const [data, setData] = useState(
    terms.map((t) => ({ stt: t.full, noidung: t.noidung }))
  );

  const [imageUrl, setImageUrl] = useState(null);

  console.log(data);

  const onChange = (rowIndex, value) => {
    const newData = [...data];
    newData[rowIndex]["noidung"] = value;
    setData(newData);
  };

  const parsedData = data.map((item) => ({
    ...item,
    noidung: item.noidung,

    onChange,
  }));
  const handleChangeImage = (info) => {
    const file = info.file?.originFileObj;
    if (!file) return; // tránh lỗi nếu file chưa có

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>{title}</Title>
      <Row style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Col>
          <ImageUploader />
        </Col>
        <Col>
          <ImageUploader />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={parsedData.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default GuildLine;
