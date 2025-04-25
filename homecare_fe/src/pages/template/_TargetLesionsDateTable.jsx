import React from "react";
import { Table, Input } from "antd";

const timepoints = ["Baseline", "TP1", "TP2", "TP3", "TP4", "TP5"];
const dataKeys = ["baseline", "tp1", "tp2", "tp3", "tp4", "tp5"];

const columnsDate = [
  {
    title: "STT",
    dataIndex: "key",
    render: (_, __, index) => "1",
    width: 60,
  },
  {
    title: "Timepoint",
    dataIndex: "location",
    render: (text, record, index) => "Ngày chụp",
    width: 150,
  },
  dataKeys.map((key, index) => ({
    title: timepoints[index],
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

const TargetLesionsDateTable = ({ dataDate, onChangeDate }) => {
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

  return (
    <Table
      columns={columnsDate}
      dataSource={parsedDataDate}
      pagination={false}
      bordered
    />
  );
};

export default TargetLesionsDateTable;
