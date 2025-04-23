import React, { useState } from "react";
import { Table, Input, Typography, Row, Col, Select } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

const responseOptions = [
  { value: "CR", label: "CR" },
  { value: "PR", label: "PR" },
  { value: "SD", label: "SD" },
  { value: "PD", label: "PD" },
];

const ConclusionTable = () => {
  // State cho phần Kết luận
  const [conclusionData, setConclusionData] = useState([
    {
      label: "Tổn thương đích:",
      value: "",
    },
    {
      label: "Tổn thương ngoài đích",
      value: "",
    },
    {
      label: "Tổn thương mới",
      value: "",
    },
    {
      label: "Tổn thương khác",
      value: "",
    },
  ]);

  // State cho phần Khuyến nghị chuyên khoa
  const [recommendationData, setRecommendationData] = useState([
    {
      label: "Khám chuyên khoa:",
      value: "",
    },
    {
      label: "CĐHA bổ sung:",
      value: "",
    },
    {
      label: "Xét nghiệm bổ sung:",
      value: "",
    },
    {
      label: "Khuyến nghị khác:",
      value: "",
    },
  ]);

  // State cho phần bác sĩ
  const [doctorData, setDoctorData] = useState({
    doctor1: "",
    doctor2: "",
    date: "",
  });

  // State cho RECIST response
  const [recistResponse, setRecistResponse] = useState("CR");

  const renderSection = (title, data, setData) => (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            textAlign: "left",
            width: "100%",
            color: "#1890ff",
          }}
        >
          {title}
        </Title>
      </div>
      {data.map((item, index) => (
        <Row key={index} style={{ marginBottom: 8, textAlign: "left" }}>
          <Col span={8}>
            <Text style={{ textAlign: "left" }}>{item.label}</Text>
          </Col>
          <Col span={16}>
            <TextArea
              value={item.value}
              onChange={(e) => {
                const newData = [...data];
                newData[index].value = e.target.value;
                setData(newData);
              }}
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
          </Col>
        </Row>
      ))}
    </div>
  );

  const renderDoctorSection = () => (
    <div style={{ marginBottom: 24, marginTop: 16 }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Title
          level={5}
          style={{
            margin: 0,
            textAlign: "left",
            width: "100%",
            color: "#1890ff",
          }}
        >
          BÁC SỸ ĐỌC KẾT QUẢ
        </Title>
      </div>
      <Row gutter={16}>
        <Col span={8}>
          <div style={{ textAlign: "center" }}>
            <Text>Bác sỹ 1</Text>
            <Input
              style={{ height: 100, marginTop: 8, marginBottom: 8 }}
              value={doctorData.doctor1}
              onChange={(e) =>
                setDoctorData({ ...doctorData, doctor1: e.target.value })
              }
            />
            <Text>Chữ ký số</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: "center" }}>
            <Text>Bác sỹ 2</Text>
            <Input
              style={{ height: 100, marginTop: 8, marginBottom: 8 }}
              value={doctorData.doctor2}
              onChange={(e) =>
                setDoctorData({ ...doctorData, doctor2: e.target.value })
              }
            />
            <Text>Chữ ký số</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: "center" }}>
            <Text>Ngày, giờ</Text>
            <div style={{ marginTop: 8 }}>
              <Input
                type="datetime-local"
                value={doctorData.date}
                onChange={(e) =>
                  setDoctorData({ ...doctorData, date: e.target.value })
                }
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {renderSection("KẾT LUẬN", conclusionData, setConclusionData)}
      <Row style={{ marginBottom: 16, textAlign: "left" }}>
        <Col span={8}>
          <Text>Đáp ứng RECIST:</Text>
        </Col>
        <Col span={16}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn đáp ứng"
            options={responseOptions}
            value={recistResponse}
            onChange={(value) => setRecistResponse(value)}
          />
        </Col>
      </Row>
      {renderSection(
        "KHUYẾN NGHỊ CHUYÊN KHOA",
        recommendationData,
        setRecommendationData
      )}
      {renderDoctorSection()}
    </div>
  );
};

export default ConclusionTable;
