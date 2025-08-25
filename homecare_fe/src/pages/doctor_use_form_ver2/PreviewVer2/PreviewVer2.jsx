import React, { useEffect, useMemo } from "react";
import { Button, Card } from "antd";
import dayjs from "dayjs";

import { ADMIN_INFO_LABELS } from "../../../constant/app";
import { calculateAge, handlePrint } from "../../formver2/utils";
import useVietnamAddress from "../../../hooks/useVietnamAddress";

import styles from "./PrintPreviewVer2.module.scss";
import { PrinterOutlined } from "@ant-design/icons";
import TablesSnapshotPreview from "./TablesSnapshotPreview";

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
const PrintPreviewVer2 = ({
  printRef,
  printTemplate,
  patientDiagnose,
  formSnapshot,
  tablesSnapshot,
  selectedExamPart,
  selectedTemplateService,
}) => {
  const LABELS = ADMIN_INFO_LABELS;
  console.log("tablesSnapshot", tablesSnapshot);

  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  useEffect(() => {
    if (patientDiagnose?.province_code) {
      setSelectedProvince(patientDiagnose.province_code);
    }
  }, [patientDiagnose?.province_code, setSelectedProvince]);

  // Map code -> name để lookup nhanh
  const provinceMap = useMemo(() => {
    const m = new Map();
    (provinces || []).forEach((p) => m.set(String(p.code), p.name));
    return m;
  }, [provinces]);

  const wardMap = useMemo(() => {
    const m = new Map();
    (wards || []).forEach((w) => m.set(String(w.code), w.name));
    return m;
  }, [wards]);

  const dob = patientDiagnose?.dob;
  const yearOfBirth = dob ? dayjs(dob).format("YYYY") : "-";
  const age = dob ? calculateAge(dob) : "-";

  const provinceName =
    provinceMap.get(String(patientDiagnose?.province_code || "")) || "-";
  const wardName = wardMap.get(String(patientDiagnose?.ward_code || "")) || "-";

  // 4-cột cố định: LabelL | ValueL | LabelR | ValueR (cân tuyệt đối)
  const pairs = [
    [
      [LABELS.full_name, patientDiagnose?.name],
      [LABELS.gender, patientDiagnose?.gender],
    ],
    [
      [LABELS.dob, yearOfBirth],
      [LABELS.age, age],
    ],
    [
      [LABELS.country, "Việt Nam"],
      [LABELS.province, provinceName],
    ],
    [
      [LABELS.ward, wardName],
      [LABELS.address, patientDiagnose?.address || "-"],
    ],
    [
      [LABELS.phoneNumber, patientDiagnose?.phoneNumber || "-"],
      [LABELS.email, patientDiagnose?.email || "-"],
    ],
  ];

  return (
    <div ref={printRef} className={styles.wrapper}>
      <Card bordered={false} className={styles.a4Page}>
        <SectionTitle>{LABELS.section_title}</SectionTitle>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            alignItems: "flex-start",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: "350px", flex: 1 }}>
            <img
              style={{
                marginTop: 10,
                objectFit: "cover",
                alignContent: "center",
              }}
              src={
                printTemplate?.logo_url ||
                "https://via.placeholder.com/150x100?text=Logo"
              }
              className="logoImg"
              alt="Logo"
              width={80}
              height={80}
            />
          </div>

          <div style={{ maxWidth: "350px", flex: 2 }}>
            <p style={{ fontWeight: 600, color: "red", fontSize: 14 }}>
              {printTemplate?.clinic_name || "[Tên phòng khám]"}
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>Khoa:</strong> {printTemplate?.department_name || "-"}
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>Địa chỉ:</strong> {printTemplate?.address || "-"}
            </p>
          </div>
          <div style={{ maxWidth: "280px", flex: 2 }}>
            <p style={{ fontSize: 13 }}>
              <strong>Website:</strong>
              <i>{printTemplate?.website || "http://..."}</i>
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>Hotline:</strong> {printTemplate?.phone || "..."}
            </p>
            <p style={{ fontSize: 13 }}>
              <strong>Email:</strong>
              <i>{printTemplate?.email || "example@email.com"}</i>
            </p>
          </div>
        </header>

        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{ width: 90 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                }}
              >
                {LABELS.full_name}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {patientDiagnose?.name}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.gender}:
              </p>
            </div>
            <p style={{ margin: 0, padding: 0 }}>{patientDiagnose?.gender}</p>
          </div>
        </div>
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.dob}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {dayjs(patientDiagnose?.dob).format("YYYY")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              margin: 0,
              padding: 0,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontWeight: 600,

                  margin: 0,
                  marginRight: 10,
                  padding: 0,
                }}
              >
                {LABELS.age}:
              </p>
            </div>
            <p style={{ margin: 0, padding: 0 }}>
              {calculateAge(patientDiagnose?.dob)}
            </p>
          </div>
        </div>
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Quốc gia */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.country}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>Việt Nam</p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.province}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {provinces.find((s) => s.code == patientDiagnose?.province_code)
                ?.name || "-"}
            </p>
          </div>
          <div style={{ display: "flex" }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                padding: 0,
                marginRight: 10,
              }}
            >
              {LABELS.district}:
            </p>
          </div>
        </div>
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.ward}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {wards.find((s) => s.code == patientDiagnose?.ward_code)?.name ||
                "-"}
            </p>
          </div>

          {/* Số nhà */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.address}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {patientDiagnose?.address || "-"}
            </p>
          </div>
        </div>
        <div
          style={{
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.phoneNumber}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {patientDiagnose?.phoneNumber}
            </p>
          </div>

          {/* Số nhà */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
            }}
          >
            <div style={{}}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  margin: 0,
                  padding: 0,
                  marginRight: 10,
                }}
              >
                {LABELS.email}:
              </p>
            </div>
            <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
              {patientDiagnose?.email || "-"}
            </p>
          </div>
        </div>

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
            {"Kỹ thuật (1)"}:
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
            {"Bộ phận (2)"}:
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
            {"Ngôn ngữ (3)"}:
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
            {"Ngôn ngữ (3)"}:
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
            {"Mã số định danh mẫu (4)"}:
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
            {"Tên mẫu (5)"}:
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
            {"Kết luận của mẫu (6)"}:
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
            {"Ngày thực hiện (7)"}:
          </p>
          <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
            {"Ngày thực hiện (7)"}
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
            {"Người thực hiện (8)"}:
          </p>
          <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
            {"Người thực hiện (8)"}
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
              src={formSnapshot?.ImageLeftUrl}
              alt={`img-${formSnapshot?.ImageLeftUrl}`}
              width={300}
              height={220}
              style={{ objectFit: "cover", backgroundColor: "#ccc" }}
            />
            <p style={{ textAlign: "center" }}>
              <a
                href={formSnapshot.ImageLeftDescLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formSnapshot.ImageLeftDesc}
              </a>
            </p>
          </section>
          <section>
            <img
              src={formSnapshot?.ImageRightUrl}
              alt={`img-${formSnapshot?.ImageRightUrl}`}
              width={300}
              height={220}
              style={{ objectFit: "cover", backgroundColor: "#ccc" }}
            />
            <p style={{ textAlign: "center" }}>
              <a
                href={formSnapshot.ImageRightDescLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formSnapshot.ImageRightDesc}
              </a>
            </p>
          </section>
        </div>

        <h4>QUY TRÌNH KỸ THUẬT</h4>
        <p className={styles.paragraph}>{formSnapshot.quyTrinh}</p>

        <h4>MÔ TẢ HÌNH ẢNH</h4>
        <TablesSnapshotPreview tablesSnapshot={tablesSnapshot} />
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
            Chẩn đoán phân biệt:{" "}
            <strong>{formSnapshot.chanDoanPhanBiet}</strong>
          </p>
        </div>

        <h4>KHUYẾN NGHỊ & TƯ VẤN (10)</h4>
        <p className={styles.paragraph}>{formSnapshot.khuyenNghi}</p>
      </Card>
    </div>
  );
};

export default PrintPreviewVer2;
