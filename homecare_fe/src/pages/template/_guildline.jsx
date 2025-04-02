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
  { short: "NE", full: "Not Evaluate" },
  { short: "NA", full: "Not Available" },
  { short: "TP", full: "Time Point" },
  { short: "BL", full: "Baseline" },
  { short: "SLD", full: "Sum of Longest Diameter" },
  { short: "BLD", full: "Baseline Sum Diameter" },
  { short: "SPD", full: "Sum of Perpendicular Diameter" },
  { short: "Nadir", full: "Nadir" },
  { short: "TL", full: "Target Lesions" },
  { short: "NTL", full: "None Target Lesions" },
  { short: "CR", full: "Complete Response" },
  { short: "PR", full: "Partial Response" },
  { short: "PD", full: "Progressive Disease" },
  { short: "SD", full: "Stable Disease" },
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
    render: (text, record, index) => (
      <Input.TextArea
        value={text}
        autoSize={{ minRows: 2, maxRows: 5 }}
        onChange={(e) => record.onChange(index, e.target.value)}
      />
    ),
    width: 200, // px
  },
].flat();

const GuildLine = ({ title }) => {
  const [data, setData] = useState(
    terms.map((t) => ({ stt: t.full, noidung: "" }))
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
