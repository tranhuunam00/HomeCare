import React from "react";
import { Table, Input, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./_TargetLesionsMainTable.css";

const columnsFn = (dataDate) =>
  [
    {
      title: "Vị trí",
      dataIndex: "location",
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
}) => {
  const parsedData = data.map((item, index) => ({
    ...item,
    baseline: Number(item.baseline) || "",
    tp1: Number(item.tp1) || "",
    tp2: Number(item.tp2) || "",
    tp3: Number(item.tp3) || "",
    tp4: Number(item.tp4) || "",
    onChange,
    onDelete: onDeleteRow,
    isLastRow: data.length === 1,
  }));

  return (
    <div>
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
      >
        Thêm dòng
      </Button>
    </div>
  );
};

export default TargetLesionsMainTable;
