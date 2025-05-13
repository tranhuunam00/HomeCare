// React component: TargetLesionsTable.js
import React, { useState } from "react";
import { Typography, Row, Col, Input } from "antd";
import TargetLesionsDateTable from "./_TargetLesionsDateTable";
import TargetLesionsMainTable from "./_TargetLesionsMainTable";
import TargetLesionsTotalTable from "./_TargetLesionsTotalTable";
import TargetLesionsChart from "./_TargetLesionsChart";

const { Title, Text } = Typography;
const { TextArea } = Input;

const TargetLesionsTable = ({ title, name_chart }) => {
  const [data, setData] = useState([
    {
      location: "RUL3",
      baseline: 52,
      tp1: 45,
      tp2: 25,
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      location: "RML5",
      baseline: 45,
      tp1: 41,
      tp2: 20,
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      location: "LLL10",
      baseline: 32,
      tp1: 32,
      tp2: 14,
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  const [dataDate, setDataDate] = useState([
    {
      location: "",
      baseline: "2024-01-01",
      tp1: "2024-05-01",
      tp2: "2025-01-01",
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  const onChange = (rowIndex, key, value) => {
    const newData = [...data];
    if (key !== "location") {
      newData[rowIndex][key] = +value || 0;
    } else {
      newData[rowIndex][key] = value;
    }
    setData(newData);
  };

  const onChangeDate = (rowIndex, key, value) => {
    const newData = [...dataDate];
    newData[rowIndex][key] = value;
    setDataDate(newData);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ textAlign: "left", color: "#1890ff" }}>
        {title}
      </Title>
      <TargetLesionsDateTable dataDate={dataDate} onChangeDate={onChangeDate} />
      <TargetLesionsMainTable data={data} onChange={onChange} />
      <TargetLesionsTotalTable
        data={data}
        dataDate={dataDate}
        onChange={onChange}
      />

      <Row style={{ marginTop: 8, marginBottom: 20 }}>
        <Col span={6}>
          <Text strong>Đánh giá đáp ứng:</Text>
        </Col>
        <Col span={18}>
          <TextArea />
        </Col>
      </Row>
      <TargetLesionsChart
        data={data}
        dataDate={dataDate}
        name_chart={name_chart}
      />
    </div>
  );
};

export default TargetLesionsTable;
