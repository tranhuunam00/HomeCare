// React component: TargetLesionsTable.js
import React, { useState, useMemo } from "react";
import { Table, Input, Typography, Row, Col } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import TextArea from "antd/es/input/TextArea";

const { Title, Text } = Typography;

const columns = [
  {
    title: "STT",
    dataIndex: "key",
    render: (_, __, index) => index + 1,
    width: 60, // px
  },
  {
    title: "Vị trí",
    dataIndex: "location",
    render: (text, record, index) => (
      <Input
        value={text}
        type="text"
        onChange={(e) => record.onChange(index, "location", e.target.value)}
      />
    ),
    width: 150,
  },
  ["baseline", "tp1", "tp2", "tp3", "tp4", "tp5"].map((key) => ({
    title: key.toUpperCase(),
    dataIndex: key,
    width: 100,
    render: (text, record, index) => (
      <Input
        type="number"
        value={text}
        onChange={(e) => record.onChange(index, key, e.target.value)}
      />
    ),
  })),
].flat();

const columnsTotal = [
  {
    title: "",
    dataIndex: "location",
    width: 210,
  },
  ["baseline", "tp1", "tp2", "tp3", "tp4", "tp5"].map((key) => ({
    title: "",
    dataIndex: key,
    width: 100,

    render: (text, record, index) => (
      <Input
        type="number"
        value={text}
        onChange={(e) => record.onChange(index, key, e.target.value)}
      />
    ),
  })),
].flat();

const columnsDate = [
  {
    title: "STT",
    dataIndex: "key",
    render: (_, __, index) => "",
    width: 60, // px
  },
  {
    title: "MSCT",
    dataIndex: "location",
    render: (text, record, index) => "",
    width: 150,
  },
  ["baseline", "tp1", "tp2", "tp3", "tp4", "tp5"].map((key) => ({
    title: "",
    dataIndex: key,
    width: 100,

    render: (text, record, index) => (
      <Input
        type="date"
        style={{ height: 20, width: "100%", fontSize: 8 }}
        value={text}
        onChange={(e) => record.onChange(index, key, e.target.value)}
      />
    ),
  })),
].flat();

const TargetLesionsTable = ({ title }) => {
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
  const parsedDataDate = dataDate.map((item) => ({
    ...item,
    baseline: item.baseline,
    tp1: item.tp1,
    tp2: item.tp2,
    tp3: item.tp3,
    tp4: item.tp4,
    tp5: item.tp5,
    onChange: onChangeDate,
  }));

  const parsedData = data.map((item) => ({
    ...item,
    baseline: Number(item.baseline) || 0,
    tp1: Number(item.tp1) || "",
    tp2: Number(item.tp2) || "",
    tp3: Number(item.tp3) || "",
    tp4: Number(item.tp4) || "",
    tp5: Number(item.tp5) || "",
    onChange,
  }));

  const getNadir = (data, dataDate) => {
    const endDate = new Date();
    endDate.setHours(23);
    endDate.setMinutes(59);
    const dates = Object.keys(dataDate[0]).filter((key) => {
      return dataDate[0][key] && new Date(dataDate[0][key]) < endDate && key;
    });

    if (dates.length == 0) return 0;
    if (dates.length == 1)
      return Number(data.reduce((acc, row) => acc + row[dates[0]], 0)) || 0;

    const values = dates.map(
      (date) => Number(data.reduce((acc, row) => acc + row[date], 0)) || 0
    );
    values.pop();

    return Math.min(...values);
  };

  const sumSLD = (tp) => parsedData.reduce((acc, row) => acc + row[tp], 0);

  console.log(sumSLD("tp5"));
  const parsedDataTotal = [
    {
      location: "Tổng SLD (mm):",
      baseline:
        Number(data.reduce((acc, row) => acc + row["baseline"], 0)) || "",
      tp1: Number(data.reduce((acc, row) => acc + row["tp1"], 0)) || "",
      tp2: Number(data.reduce((acc, row) => acc + row["tp2"], 0)) || "",
      tp3: Number(data.reduce((acc, row) => acc + row["tp3"], 0)) || "",
      tp4: Number(data.reduce((acc, row) => acc + row["tp4"], 0)) || "",
      tp5: Number(data.reduce((acc, row) => acc + row["tp5"], 0)) || "",
    },
    {
      location: "Nadir (mm):",
      baseline: getNadir(data, dataDate),
    },
    {
      location: "Thay đổi SLD:",
      baseline: "",
      tp1:
        sumSLD("tp1") != 0
          ? (sumSLD("tp1") - sumSLD("baseline")) / sumSLD("baseline")
          : "",
      tp2:
        sumSLD("tp2") != 0
          ? (sumSLD("tp2") - sumSLD("baseline")) / sumSLD("baseline")
          : "",
      tp3:
        sumSLD("tp3") != 0
          ? (sumSLD("tp3") - sumSLD("baseline")) / sumSLD("baseline")
          : "",
      tp4:
        sumSLD("tp4") != 0
          ? (sumSLD("tp4") - sumSLD("baseline")) / sumSLD("baseline")
          : "",
      tp5:
        sumSLD("tp5") != 0
          ? (sumSLD("tp5") - sumSLD("baseline")) / sumSLD("baseline")
          : "",
    },
    {
      location: "Thay đổi Nadir:",
      baseline: "",
      tp1:
        sumSLD("tp1") != 0
          ? (sumSLD("tp1") - getNadir(data, dataDate)) /
            getNadir(data, dataDate)
          : "",
      tp2:
        sumSLD("tp2") != 0
          ? (sumSLD("tp2") - getNadir(data, dataDate)) /
            getNadir(data, dataDate)
          : "",
      tp3:
        sumSLD("tp3") != 0
          ? (sumSLD("tp3") - getNadir(data, dataDate)) /
            getNadir(data, dataDate)
          : "",
      tp4:
        sumSLD("tp4") != 0
          ? (sumSLD("tp4") - getNadir(data, dataDate)) /
            getNadir(data, dataDate)
          : "",
      tp5:
        sumSLD("tp5") != 0
          ? (sumSLD("tp5") - getNadir(data, dataDate)) /
            getNadir(data, dataDate)
          : "",
    },
  ];

  const chartData = useMemo(
    () =>
      Object.keys(parsedDataTotal[0])
        .filter((key) => key != "location")
        .map((key) => ({
          date: dataDate[0][key],
          sld: parsedDataTotal[0][key],
        }))
        .filter((d) => d.date),
    [data, dataDate]
  );

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>{title}</Title>
      <Table
        columns={columnsDate}
        dataSource={parsedDataDate}
        pagination={false}
        bordered
      />
      <Table
        columns={columns}
        dataSource={parsedData.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        bordered
      />
      <Table
        columns={columnsTotal}
        dataSource={parsedDataTotal}
        pagination={false}
        bordered
      />

      <Row style={{ marginTop: 8 }}>
        <Col span={24}>
          <Text strong>Đánh giá đáp ứng:</Text>
          <TextArea />
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24 }}>
        Đồ thị minh hoạ thay đổi SLD
      </Title>
      <LineChart
        width={700}
        height={300}
        data={chartData}
        margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[50, 200]} />
        <Tooltip />
        <ReferenceLine
          y={sumSLD("baseline") * 0.7}
          stroke="red"
          label={{
            value: "PR: -30% from baseline",
            position: "insideRight",
            fill: "red",
          }}
          strokeDasharray="3 3"
        />
        <ReferenceLine
          y={Math.floor(getNadir(data, dataDate) * 1.2)}
          stroke="red"
          label={{
            value: "PD: +20% from nadir",
            position: "insideRight",
            fill: "red",
          }}
          strokeDasharray="3 3"
        />
        <Line type="monotone" dataKey="sld" stroke="#8884d8" dot={{ r: 4 }} />
      </LineChart>
    </div>
  );
};

export default TargetLesionsTable;
