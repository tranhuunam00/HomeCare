import React, { useState } from "react";
import { Table, Input, Typography, Row, Col, Select } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

const responseOptions = [
  {
    value: "CR",
    label:
      "CR - Complete Response: Bệnh thoái triển hoàn toàn: không còn thấy (< 10mm đối với hạch) và không có tổn thương mới",
  },
  {
    value: "PR",
    label:
      "PR - Partial Response: Bệnh thoái triển một phần: SLD giảm tối thiểu 30% so với BLD và không có tổn thương mới",
  },
  {
    value: "PD",
    label:
      "PD - Progressive Disease: Bệnh tiến triển: có tổn thương mới hoặc SLD tăng tối thiểu 20% (hoặc 5mm) so với NADIR",
  },
  {
    value: "SD",
    label:
      "SD - Stable Disease: Bệnh ổn định: không đủ tiêu chuẩn của PR và PD",
  },
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
            <Text style={{ textAlign: "left", fontSize: "18px" }}>
              {item.label}
            </Text>
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
          <Text style={{ fontSize: "18px" }}>Đáp ứng RECIST:</Text>
        </Col>
        <Col span={16}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn đáp ứng"
            options={responseOptions}
            value={recistResponse}
            onChange={(value) => setRecistResponse(value)}
            optionLabelProp="label"
            dropdownStyle={{ whiteSpace: "normal", maxWidth: 600 }}
            className="no-print"
          />
          <TextArea
            style={{ marginTop: 8 }}
            value={
              responseOptions.find((opt) => opt.value === recistResponse)
                ?.label || ""
            }
            autoSize={{ minRows: 2, maxRows: 6 }}
            readOnly
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
