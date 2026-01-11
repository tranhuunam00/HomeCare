import React from "react";
import { Input, Radio, Button, Row, Col } from "antd";
import styles from "./ImagingStructureTable.module.scss";
import TextArea from "antd/es/input/TextArea";

const ImagingStructureTable = ({
  rows,
  setRows,
  isEdit = true,
  setDiagnosisSummary,
  abnormalFindings,
  form,
}) => {
  const updateRow = (index, key, value) => {
    const next = [...rows];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    setRows(next);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa hàng này không?");
    if (!ok) return;

    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      {" "}
      <table className={styles.imagingTable}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Cấu trúc</th>
            <th>Bình thường</th>
            <th>Bất thường</th>
            <th>Xóa</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td>{idx + 1}</td>

              <td>
                <Input
                  disabled={!isEdit}
                  value={row.name}
                  onChange={(e) => updateRow(idx, "name", e.target.value)}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                <Radio
                  checked={row.status === "normal"}
                  disabled={!isEdit}
                  onChange={() => updateRow(idx, "status", "normal")}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                <Radio
                  checked={row.status === "abnormal"}
                  disabled={!isEdit}
                  onChange={() => updateRow(idx, "status", "abnormal")}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                <Button
                  danger
                  size="small"
                  disabled={!isEdit || rows.length === 1}
                  onClick={() => handleDelete(row.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        type="link"
        disabled={!isEdit}
        onClick={() =>
          setRows((prev) => [
            ...prev,
            {
              id: Date.now(),
              name: "",
              status: "normal",
              description: "",
            },
          ])
        }
      >
        + Thêm hàng
      </Button>
      {rows.some((r) => r.status === "abnormal") && (
        <>
          <div style={{ marginTop: 24, fontWeight: 600 }}>
            Mô tả chi tiết các bất thường
          </div>

          {rows
            .filter((r) => r.status === "abnormal")
            .map((row, idx) => (
              <Row key={row.id} gutter={8} style={{ marginTop: 8 }}>
                <Col span={1}>{idx + 1}</Col>
                <Col span={5}>
                  <strong>{row.name}</strong>
                </Col>
                <Col span={18}>
                  <TextArea
                    disabled={!isEdit}
                    placeholder="Nhập mô tả bất thường..."
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    value={row.description}
                    onChange={(e) => {
                      const next = rows.map((r) =>
                        r.id === row.id
                          ? { ...r, description: e.target.value }
                          : r
                      );
                      setRows(next);
                    }}
                  />
                </Col>
              </Row>
            ))}

          <Button
            type="link"
            disabled={!isEdit}
            onClick={() => {
              if (abnormalFindings.length > 0) {
                const summary = abnormalFindings
                  .map((item) => `• ${item}`)
                  .join("\n");

                setDiagnosisSummary(summary);
                form.setFieldsValue({
                  imagingDiagnosisSummary: summary,
                });
              }
            }}
          >
            Đồng bộ xuống kết luận
          </Button>
        </>
      )}
    </div>
  );
};

export default ImagingStructureTable;
