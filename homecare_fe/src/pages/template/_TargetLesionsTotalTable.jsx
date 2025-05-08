import React, { useState } from "react";
import { Table, Input } from "antd";
import "./_TargetLesionsTotalTable.css";

const { TextArea } = Input;

const columnsTotal = [
  {
    title: "",
    dataIndex: "location",
    width: 150,
    render: (text, record) => {
      if (record.isTextArea) {
        return {
          children: text,
          props: {
            style: { background: "#fafafa" },
          },
        };
      }
      return text;
    },
  },
  ["baseline", "tp1", "tp2", "tp3", "tp4"].map((key, index) => ({
    title: "",
    dataIndex: key,
    width: 100,
    render: (text, record, rowIndex) => {
      if (record.isTextArea) {
        if (index === 0) {
          return {
            children: (
              <TextArea
                value={record.response}
                onChange={(e) => record.onResponseChange(e.target.value)}
                autoSize={{ minRows: 2 }}
                style={{ width: "100%" }}
              />
            ),
            props: {
              colSpan: 6,
            },
          };
        }
        return {
          props: {
            colSpan: 0,
          },
        };
      }
      return (
        <Input
          type="number"
          value={text}
          onChange={(e) => record.onChange(rowIndex, key, e.target.value)}
        />
      );
    },
  })),
].flat();

const TargetLesionsTotalTable = ({ data, dataDate, onChange }) => {
  const [responseText, setResponseText] = useState("");

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

  const sumSLD = (tp) => data.reduce((acc, row) => acc + row[tp], 0);

  const parsedDataTotal = [
    {
      location: "Tổng SLD (mm):",
      baseline:
        Number(data.reduce((acc, row) => acc + row["baseline"], 0)) || "",
      tp1: Number(data.reduce((acc, row) => acc + row["tp1"], 0)) || "",
      tp2: Number(data.reduce((acc, row) => acc + row["tp2"], 0)) || "",
      tp3: Number(data.reduce((acc, row) => acc + row["tp3"], 0)) || "",
      tp4: Number(data.reduce((acc, row) => acc + row["tp4"], 0)) || "",
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
    },
    {
      key: "response",
      location: "Đánh giá đáp ứng:",
      response: responseText,
      isTextArea: true,
      onResponseChange: (value) => setResponseText(value),
    },
  ];

  return (
    <Table
      className="table-total-custom"
      columns={columnsTotal}
      dataSource={parsedDataTotal}
      pagination={false}
      bordered
    />
  );
};

export default TargetLesionsTotalTable;
