import React from "react";
import { Table, Input } from "antd";

const columns = [
  {
    title: "STT",
    dataIndex: "key",
    render: (_, __, index) => index + 1,
    width: 60,
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

const TargetLesionsMainTable = ({ data, onChange }) => {
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

  return (
    <Table
      columns={columns}
      dataSource={parsedData.map((item, index) => ({ ...item, key: index }))}
      pagination={false}
      bordered
    />
  );
};

export default TargetLesionsMainTable;
