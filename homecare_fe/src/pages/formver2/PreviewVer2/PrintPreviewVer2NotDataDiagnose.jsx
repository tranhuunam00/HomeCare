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
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";

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
  initialSnap,
  currentFormVer2Name,
  editId,
}) => {
  const { examParts, templateServices, user, doctor, formVer2Names } =
    useGlobalAuth();

  const LABELS = ADMIN_INFO_LABELS;
  const printRef = useRef();

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card bordered={false} className={styles.a4Page}>
          <h2 className={styles.center}>
            BỘ MẪU KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH D-RAD
          </h2>
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
              {"Phân hệ"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {selectedExamPart?.name ||
                templateServices?.find(
                  (t) => t.id == formSnapshot.id_template_service
                )?.name}
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
              {selectedTemplateService?.name ||
                examParts?.find((t) => t.id == formSnapshot.id_exam_part)?.name}
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
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {currentFormVer2Name?.code}
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
              {"Tên mẫu"}:
            </p>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {currentFormVer2Name?.name}
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
              {dayjs(initialSnap?.apiData?.createdAt || new Date()).format(
                "DD-MM-YYYY"
              )}
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
              {initialSnap?.apiData?.id_doctor_doctor?.full_name ||
                doctor?.full_name}
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
                style={{ objectFit: "contain", backgroundColor: "#e4e4e4ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={
                    formSnapshot?.ImageLeftDescLink ||
                    formSnapshot.image_form_ver2s.find((i) => i.kind == "left")
                      ?.link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageLeftDesc ||
                    formSnapshot.image_form_ver2s.find((i) => i.kind == "left")
                      ?.desc}
                </a>
              </p>
            </section>
            <section>
              <img
                src={formSnapshot?.ImageRightUrl || ImageRightUrl}
                alt={`img-${formSnapshot?.ImageRightUrl}`}
                width={300}
                height={220}
                style={{ objectFit: "contain", backgroundColor: "#e4e4e4ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={
                    formSnapshot?.ImageRightDescLink ||
                    formSnapshot.image_form_ver2s.find((i) => i.kind == "right")
                      ?.link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageRightDesc ||
                    formSnapshot.image_form_ver2s.find((i) => i.kind == "right")
                      ?.desc}
                </a>
              </p>
            </section>
          </div>

          <h4>QUY TRÌNH KỸ THUẬT / LINK</h4>
          <p className={styles.paragraph}>
            {formSnapshot.quyTrinh || formSnapshot.quy_trinh_url}
          </p>

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
          <p className={styles.paragraph}>
            {formSnapshot.khuyenNghi || formSnapshot.khuyen_nghi}
          </p>
        </Card>
      </div>
      <FormActionBar
        onPrint={() => handlePrint(printRef)}
        keys={["print"]}
        editId={editId}
      />
    </div>
  );
};

export default PrintPreviewVer2NotDataDiagnose;
