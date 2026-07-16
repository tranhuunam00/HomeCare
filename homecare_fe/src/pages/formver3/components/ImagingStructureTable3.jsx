import React, { useEffect, useRef, useState } from "react";
import { Input, Radio, Button, Row, Col } from "antd";
import styles from "./ImagingStructureTable.module.scss";
import TextArea from "antd/es/input/TextArea";
import { formatIndentedList } from "../formver3.constant";
import { translateLabel } from "../../../constant/app";
import { SyncOutlined } from "@ant-design/icons";
import useConfirmAction from "../../../hooks/useConfirmAction";
import ConfirmActionModal from "../../../components/ConfirmActionModal/ConfirmActionModal";

const ImagingStructureTable = ({
  rows,
  setRows,
  isEdit = true,
  setDiagnosisSummary,
  abnormalFindings,
  languageTranslate,
  form,
}) => {
  const { confirmState, openConfirm } = useConfirmAction();
  const [autoSync, setAutoSync] = useState(true);
  const isFirstSyncRef = useRef(true);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (!autoSync) return;

    // 🚫 bỏ qua lần chạy đầu (fetch data lần đầu)
    if (isFirstSyncRef.current) {
      isFirstSyncRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (abnormalFindings.length > 0) {
        const summary = formatIndentedList(abnormalFindings);
        setDiagnosisSummary(summary);
        form.setFieldsValue({
          imagingDiagnosisSummary: summary,
        });
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [abnormalFindings, autoSync]);

  const updateRow = (index, key, value) => {
    const next = [...rows];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    setRows(next);
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Xác nhận xóa",
      message: "Bạn có chắc muốn xóa hàng này không?",
      onConfirm: async () => {
        setRows((prev) => prev.filter((r) => r.id !== id));
      },
    });
  };

  return (
    <div>
      {" "}
      <table className={styles.imagingTable}>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Bình thường</th>
            <th>Bất thường</th>
            <th></th>
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
          <div style={{ marginTop: 24, fontWeight: 600, fontSize: "13px", color: "#374151" }}>
            {translateLabel(languageTranslate, "Mô tả chi tiết", false)}
          </div>

          {rows
            .filter((r) => r.status === "abnormal")
            .map((row, idx) => (
              <Row key={row.id} gutter={8} style={{ marginTop: 8 }}>
                <Col span={1} style={{ fontSize: "12px", color: "#6b7280", paddingTop: "5px" }}>{idx + 1}</Col>
                <Col span={6} style={{ fontSize: "12px", fontWeight: "600", color: "#1f2937", lineHeight: "1.4", paddingTop: "5px" }}>
                  {row.name}
                </Col>
                <Col span={17}>
                  <TextArea
                    disabled={!isEdit}
                    placeholder="Nhập mô tả bất thường..."
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    value={row.description}
                    onChange={(e) => {
                      const next = rows.map((r) =>
                        r.id === row.id
                          ? { ...r, description: e.target.value }
                          : r,
                      );
                      setRows(next);
                    }}
                  />
                </Col>
              </Row>
            ))}

          <Button
            type="default"
            size="small"
            icon={<SyncOutlined spin={autoSync} />}
            disabled={!isEdit}
            onClick={() => setAutoSync((prev) => !prev)}
            style={{
              borderColor: autoSync ? "#3b82f6" : "#d9d9d9",
              color: autoSync ? "#1d4ed8" : "#595959",
              backgroundColor: autoSync ? "#eff6ff" : "#fafafa",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
              fontSize: "12px",
              padding: "4px 12px",
              height: "28px",
              borderRadius: "6px",
              transition: "all 0.3s ease",
            }}
          >
            {autoSync ? "Tắt tự động đồng bộ" : "Bật tự động đồng bộ"}
          </Button>
        </>
      )}
      <ConfirmActionModal {...confirmState} />
    </div>
  );
};

export default ImagingStructureTable;
