import React, { useState } from "react";
import { Table, Input, Select } from "antd";
import "./_TargetLesionsTotalTable.css";

const { TextArea } = Input;
const { Option } = Select;

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

const columnsTotal = [
  {
    title: "",
    dataIndex: "location",
    width: 150,
    align: "center",
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
    align: "center",
    render: (text, record, rowIndex) => {
      if (record.isTextArea) {
        if (index === 0) {
          return {
            children: (
              <Select
                value={record.response}
                onChange={record.onResponseChange}
                style={{ width: "100%" }}
                placeholder="Chọn đánh giá đáp ứng"
                showSearch
                optionFilterProp="label"
              >
                {responseOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value} label={opt.label}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
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
      if (
        record.location === "Thay đổi SLD:" ||
        record.location === "Thay đổi Nadir:"
      ) {
        return text !== "" ? <span>{text}%</span> : <span></span>;
      }
      return <span>{text}</span>;
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
        Number(data.reduce((acc, row) => acc + row["baseline"], 0)) || 0,
      tp1: Number(data.reduce((acc, row) => acc + row["tp1"], 0)) || 0,
      tp2: Number(data.reduce((acc, row) => acc + row["tp2"], 0)) || 0,
      tp3: Number(data.reduce((acc, row) => acc + row["tp3"], 0)) || 0,
      tp4: Number(data.reduce((acc, row) => acc + row["tp4"], 0)) || 0,
    },
    {
      location: "Nadir (mm):",
      baseline: getNadir(data, dataDate),
    },
    {
      location: "Thay đổi SLD:",
      baseline: "",
      tp1:
        sumSLD("tp1") !== 0
          ? (
              ((sumSLD("tp1") - sumSLD("baseline")) / sumSLD("baseline")) *
              100
            ).toFixed(1)
          : "",
      tp2:
        sumSLD("tp2") !== 0
          ? (
              ((sumSLD("tp2") - sumSLD("baseline")) / sumSLD("baseline")) *
              100
            ).toFixed(1)
          : "",
      tp3:
        sumSLD("tp3") !== 0
          ? (
              ((sumSLD("tp3") - sumSLD("baseline")) / sumSLD("baseline")) *
              100
            ).toFixed(1)
          : "",
      tp4:
        sumSLD("tp4") !== 0
          ? (
              ((sumSLD("tp4") - sumSLD("baseline")) / sumSLD("baseline")) *
              100
            ).toFixed(1)
          : "",
    },
    {
      location: "Thay đổi Nadir:",
      baseline: "",
      tp1:
        sumSLD("tp1") !== 0
          ? (
              ((sumSLD("tp1") - getNadir(data, dataDate)) /
                getNadir(data, dataDate)) *
              100
            ).toFixed(1)
          : "",
      tp2:
        sumSLD("tp2") !== 0
          ? (
              ((sumSLD("tp2") - getNadir(data, dataDate)) /
                getNadir(data, dataDate)) *
              100
            ).toFixed(1)
          : "",
      tp3:
        sumSLD("tp3") !== 0
          ? (
              ((sumSLD("tp3") - getNadir(data, dataDate)) /
                getNadir(data, dataDate)) *
              100
            ).toFixed(1)
          : "",
      tp4:
        sumSLD("tp4") !== 0
          ? (
              ((sumSLD("tp4") - getNadir(data, dataDate)) /
                getNadir(data, dataDate)) *
              100
            ).toFixed(1)
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
