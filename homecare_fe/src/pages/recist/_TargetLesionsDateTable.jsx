import React from "react";
import { Table, Input } from "antd";

const timepoints = ["Baseline", "TP1", "TP2", "TP3", "TP4"];
const dataKeys = ["baseline", "tp1", "tp2", "tp3", "tp4"];

const columnsDate = [
  {
    title: "Timepoint",
    dataIndex: "location",
    render: () => "Ngày chụp",
    width: 160,
    align: "center",
  },
  ...dataKeys.map((key, index) => ({
    title: timepoints[index],
    dataIndex: key,
    width: 100,
    align: "center",
    render: (text, record, rowIndex) => (
      <input
        type="date"
        value={text}
        onChange={(e) => record.onChange(rowIndex, key, e.target.value)}
        style={{
          height: 28,
          fontSize: 15,
          width: 106,
          padding: "3px 0px",
          border: "1px solid #d9d9d9",
          borderRadius: 4,
        }}
      />
    ),
  })),
];

const TargetLesionsDateTable = ({ dataDate, onChangeDate }) => {
  const parsedDataDate = dataDate.map((item) => ({
    ...item,
    baseline: item.baseline || "",
    tp1: item.tp1 || "",
    tp2: item.tp2 || "",
    tp3: item.tp3 || "",
    tp4: item.tp4 || "",
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
