// OtherAssessmentTable.jsx
import React, { useState } from "react";
import { Table, Input, Typography } from "antd";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

const OtherAssessmentTable = ({ title }) => {
  const [tableData, setTableData] = useState([
    {
      key: "dates",
      structure: "Ngày chụp MSCT",
      isDateRow: true,
    },
    {
      key: "tmcua",
      structure: "Tĩnh mạch cửa",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "tmgan",
      structure: "Tĩnh mạch gan",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "dongMachGan",
      structure: "Động mạch gan",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "duongMatTrongGan",
      structure: "Đường mật trong gan",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "duongMatNgoaiGan",
      structure: "Đường mật ngoài gan",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "tuiMat",
      structure: "Túi mật",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "lach",
      structure: "Lách",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "tuy",
      structure: "Tụy",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "tuyenThuongThanPhai",
      structure: "Tuyến thượng thận phải",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
    {
      key: "tuyenThuongThanTrai",
      structure: "Tuyến thượng thận trái",
      baseline: "",
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
    },
  ]);

  const [dates, setDates] = useState({
    baseline: "2023-10-01",
    tp1: "2024-02-01",
    tp2: "2024-05-25",
    tp3: "",
    tp4: "",
    tp5: "",
  });

  const handleDateChange = (timePoint, value) => {
    setDates((prev) => ({
      ...prev,
      [timePoint]: value,
    }));
  };

  const handleValueChange = (rowKey, timePoint, value) => {
    console.log("rowKey, timePoint, value", rowKey, timePoint, value);
    setTableData((prev) =>
      prev.map((row) =>
        row.key === rowKey ? { ...row, [timePoint]: value } : row
      )
    );
  };

  const timePoints = [
    { key: "baseline", title: "BASELINE" },
    { key: "tp1", title: "TP1" },
    { key: "tp2", title: "TP2" },
    { key: "tp3", title: "TP3" },
    { key: "tp4", title: "TP4" },
    { key: "tp5", title: "TP5" },
  ];

  const columns = [
    {
      title: "Cấu trúc",
      dataIndex: "structure",
      width: "15%",
      className: "structure-column",
    },
    ...timePoints.map((tp) => ({
      title: tp.title,
      dataIndex: tp.key,
      width: "14.16%",
      render: (text, record) => {
        if (record.isDateRow) {
          return (
            <DatePicker
              value={dates[tp.key] ? dayjs(dates[tp.key]) : null}
              onChange={(date) =>
                handleDateChange(tp.key, date ? date.format("YYYY-MM-DD") : "")
              }
              style={{ width: "100%" }}
              size="small"
            />
          );
        }
        return (
          <Input
            type="number"
            value={record[tp.key]}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleValueChange(record.key, tp.key, value);
              }
            }}
            size="small"
          />
        );
      },
    })),
  ];

  return (
    <div style={{ padding: 24 }}>
      <style>
        {`
          .assessment-table {
            .structure-column {
              white-space: normal;
              word-wrap: break-word;
            }
            
            .ant-table-cell {
              padding: 2px !important;
            }
          }
        `}
      </style>
      <Title level={4}>{title || "ĐÁNH GIÁ KHÁC"}</Title>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
        size="small"
        className="assessment-table"
        style={{
          width: "100%",
          tableLayout: "fixed",
        }}
      />
    </div>
  );
};

export default OtherAssessmentTable;
