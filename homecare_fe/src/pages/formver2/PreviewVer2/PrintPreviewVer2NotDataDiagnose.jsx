import React, { useRef } from "react";
import { Button, Card } from "antd";

import { ADMIN_INFO_LABELS } from "../../../constant/app";

import styles from "./PrintPreviewVer2NotDataDiagnose.module.scss";
import { PrinterOutlined } from "@ant-design/icons";
import TablesSnapshotPreview from "./TablesSnapshotPreview";
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import FormActionBar from "../component/FormActionBar";
import { handlePrint } from "../utils";
import InnerHTMLFormEditor from "./InnerHTMLFormEditor";

const SectionTitle = ({ children }) => (
  <h3 className={styles.sectionTitle}>{children}</h3>
);

const KVRow = ({ label, value }) => (
  <div className={styles.kvRow}>
    <div className={styles.label}>{label}:</div>
    <div className={styles.value}>{value ?? "-"}</div>
  </div>
);

/* ---------- Main ---------- */
const PrintPreviewVer2NotDataDiagnose = ({
  formSnapshot,
  tablesSnapshot,
  selectedExamPart,
  selectedTemplateService,
  ImageLeftUrl,
  ImageRightUrl,
  imageDescEditor,
}) => {
  const LABELS = ADMIN_INFO_LABELS;
  const printRef = useRef();

  console.log("imageDescEditor", imageDescEditor);

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card bordered={false} className={styles.a4Page}>
          <h2 className={styles.center}>KẾT QUẢ D-FORM</h2>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Kỹ thuật"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {selectedExamPart?.name}
            </p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Bộ phận"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {selectedTemplateService?.name}
            </p>
          </div>

          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Ngôn ngữ"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>{"Vi"}</p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Mã số định danh mẫu"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>{"auto"}</p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Tên mẫu"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {formSnapshot?.tenMau}
            </p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Kết luận của mẫu"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {formSnapshot?.ketLuan}
            </p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Ngày thực hiện"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {"Ngày thực hiện"}
            </p>
          </div>
          <div
            style={{
              marginBottom: 6,
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {"Người thực hiện"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {"Người thực hiện"}
            </p>
          </div>

          <h2 className={styles.center}>NỘI DUNG THỰC HIỆN</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <section>
              <img
                src={formSnapshot?.ImageLeftUrl || ImageLeftUrl}
                alt={`img-${formSnapshot?.ImageLeftUrl}`}
                width={300}
                height={220}
                style={{ objectFit: "cover", backgroundColor: "#ccc" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={formSnapshot?.ImageLeftDescLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageLeftDesc}
                </a>
              </p>
            </section>
            <section>
              <img
                src={formSnapshot?.ImageRightUrl || ImageRightUrl}
                alt={`img-${formSnapshot?.ImageRightUrl}`}
                width={300}
                height={220}
                style={{ objectFit: "cover", backgroundColor: "#ccc" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={formSnapshot?.ImageRightDescLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageRightDesc}
                </a>
              </p>
            </section>
          </div>

          <h4>QUY TRÌNH KỸ THUẬT</h4>
          <p className={styles.paragraph}>{formSnapshot.quyTrinh}</p>

          <h4>MÔ TẢ HÌNH ẢNH</h4>
          <TablesSnapshotPreview tablesSnapshot={tablesSnapshot} />
          <InnerHTMLFormEditor data={imageDescEditor} />

          <h4>KẾT LUẬN, CHẨN ĐOÁN</h4>
          <p className={styles.paragraph}>{formSnapshot.ketQuaChanDoan}</p>

          <div className={styles.box}>
            <p>
              Phân loại IDC-10: <strong>{formSnapshot.icd10}</strong>
            </p>
            <p>
              Phân độ, phân loại: <strong>{formSnapshot.phanDoLoai}</strong>
            </p>
            <p>
              Chẩn đoán phân biệt
              <strong>{formSnapshot.chanDoanPhanBiet}</strong>
            </p>
          </div>

          <h4>KHUYẾN NGHỊ & TƯ VẤN</h4>
          <p className={styles.paragraph}>{formSnapshot.khuyenNghi}</p>
        </Card>
      </div>
      <FormActionBar
        onPrint={() => handlePrint(printRef)}
        keys={["export", "print"]}
      />
    </div>
  );
};

export default PrintPreviewVer2NotDataDiagnose;
