import React from "react";
import { Table, Input, Button } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./_TargetLesionsMainTable.css";

const columnsFn = (dataDate) =>
  [
    {
      title: "Vị trí",
      dataIndex: "location",
      align: "center",
      render: (text, record, index) => (
        <Input
          value={text}
          type="text"
          onChange={(e) => record.onChange(index, "location", e.target.value)}
          disabled={!dataDate[0]?.baseline}
        />
      ),
      width: 150,
    },
    ["baseline", "tp1", "tp2", "tp3", "tp4"].map((key, colIdx, arr) => ({
      title: key.toUpperCase(),
      dataIndex: key,
      width: 100,
      align: "center",
      render: (text, record, index) => {
        const isEnabled = !!dataDate[0]?.[key];
        if (colIdx === arr.length - 1) {
          return (
            <div style={{ position: "relative" }} className="row-hover-action">
              <Input
                type="number"
                value={text}
                onChange={(e) => record.onChange(index, key, e.target.value)}
                disabled={!isEnabled}
                style={{ textAlign: "right" }}
              />
              <Button
                className="delete-row-btn"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => record.onDelete(index)}
                disabled={record.isLastRow}
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          );
        }
        return (
          <Input
            type="number"
            value={text}
            onChange={(e) => record.onChange(index, key, e.target.value)}
            disabled={!isEnabled}
            style={{ textAlign: "right" }}
          />
        );
      },
    })),
  ].flat();

const TargetLesionsMainTable = ({
  data,
  onChange,
  onAddRow,
  onDeleteRow,
  dataDate,
  onReset,
}) => {
  const parsedData = data.map((item, index) => ({
    ...item,
    baseline: Number(item.baseline) || 0,
    tp1: Number(item.tp1) || 0,
    tp2: Number(item.tp2) || 0,
    tp3: Number(item.tp3) || 0,
    tp4: Number(item.tp4) || 0,
    onChange,
    onDelete: onDeleteRow,
    isLastRow: data.length === 1,
  }));

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <Button
          onClick={onReset}
          type="default"
          size="small"
          icon={<ReloadOutlined />}
          className="no-print"
        />
      </div>
      <Table
        columns={columnsFn(dataDate)}
        dataSource={parsedData.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        bordered
      />
      <Button
        type="dashed"
        onClick={onAddRow}
        block
        icon={<PlusOutlined />}
        style={{ marginTop: "8px" }}
        className="no-print"
      >
        Thêm dòng
      </Button>
    </div>
  );
};

export default TargetLesionsMainTable;
