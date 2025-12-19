import React, { useEffect, useRef } from "react";
import { Button, Card, Divider } from "antd";

import { translateLabel } from "../../../constant/app";

import styles from "./PreviewSono.module.scss";
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import { handlePrint } from "../../formver2/utils";
import FormActionBar from "../../formver2/component/FormActionBar";
import { THYROID_ULTRASOUND_TEXT } from "../details/tuyengiap/tuyengiap.constants";
import {
  SONO_CONTENT,
  SONO_CONTENT_IMAGE,
} from "../details/bung/bung.constants";

const PrintItem = ({ label, value }) => (
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
      {label}:
    </p>
    <p style={{ fontSize: 14, margin: 0, padding: 0 }}>{value || ""}</p>
  </div>
);

/* ---------- Main ---------- */
const PreviewSono = ({
  formSnapshot,
  editId,
  printTemplate = {},
  doctor = {},
  languageTranslate = "vi",
  approvalStatus,
  ket_qua_chan_doan = [],
  rows = [],
  rowsByField = {},
  field1,
}) => {
  console.log("printTemplate", printTemplate);
  const { user } = useGlobalAuth();
  const printRef = useRef();
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();
  useEffect(() => {
    setSelectedProvince(formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho);
  }, [formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho]);
  const provinceName =
    provinces.find(
      (p) => p.code == formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho
    )?.name || formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho;

  const wardName =
    wards.find((w) => w.code == formSnapshot?.benh_nhan_dia_chi_xa_phuong)
      ?.name || formSnapshot?.benh_nhan_dia_chi_xa_phuong;

  console.log("formSnapshot", formSnapshot);

  const fieldList = Object.keys(rowsByField);

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card bordered={false} className={styles.a4Page} style={{ padding: 0 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            <div style={{ maxWidth: "350px", flex: 1, marginLeft: 60 }}>
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

            <div style={{ maxWidth: "350px", flex: 6 }}>
              <p style={{ fontWeight: 600, color: "#2f6db8", fontSize: 14 }}>
                {printTemplate?.clinic_name || ""}
              </p>
              <p style={{ fontSize: 13 }}>
                <strong>
                  {translateLabel(languageTranslate, "division", false)}:
                </strong>
                {printTemplate?.department_name || "-"}
              </p>
              <p style={{ fontSize: 13 }}>
                <strong>
                  {translateLabel(languageTranslate, "address", false)}:
                </strong>
                {printTemplate?.address || "-"}
              </p>
            </div>
            <div style={{ maxWidth: "280px", flex: 5 }}>
              <p style={{ fontSize: 13 }}>
                <strong>Website: </strong>
                {printTemplate?.website || "http://..."}
              </p>
              <p style={{ fontSize: 13 }}>
                <strong>Hotline: </strong> {printTemplate?.phone || "..."}
              </p>
              <p style={{ fontSize: 13 }}>
                <strong>Email: </strong>
                {printTemplate?.email || "example@email.com"}
              </p>
            </div>
          </header>

          <h1
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
            }}
          >
            {"PHIẾU KẾT QUẢ"}
          </h1>
          <h2
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              fontSize: 23,
            }}
          >
            {"SIÊU ÂM - SONOGRAPHY"}
          </h2>

          <>
            <h3
              style={{
                textAlign: "left",
                color: "#2f6db8",
                margin: 0,
                padding: 0,
                marginBottom: 20,
                marginTop: 20,
              }}
            >
              {translateLabel(
                languageTranslate,
                "administrativeInfo",
                false
              ).toUpperCase()}
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "fullName",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_ho_ten}
              />
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "gender",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_gioi_tinh}
              />
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "age",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_tuoi}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "address",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_dia_chi_so_nha}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "district",
                  false
                ).toUpperCase()}
                value={wardName}
              />

              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "province",
                  false
                ).toUpperCase()}
                value={provinceName}
              />
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "nationality",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_quoc_tich}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "phone",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_dien_thoai}
              />
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "email",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_email}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "patientId",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_pid}
              />
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "sid",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_sid}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={translateLabel(
                  languageTranslate,
                  "clinical",
                  false
                ).toUpperCase()}
                value={formSnapshot?.benh_nhan_lam_sang}
              />
            </div>
          </>
          <h3
            style={{
              textAlign: "left",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              marginBottom: 0,
              marginTop: 20,
            }}
          >
            {"QUY TRÌNH KỸ THUẬT"}
          </h3>

          <p>{`Thực hiện siêu âm ${field1}`}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <section>
              <img
                src={"/product/sono/" + SONO_CONTENT_IMAGE[field1][0]}
                alt={`img-${formSnapshot?.ImageLeftUrl}`}
                width={300}
                height={220}
                style={{ objectFit: "contain", backgroundColor: "#c0b6b6ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={"www.home-care.vn"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Quy trình kỹ thuật"}
                </a>
              </p>
            </section>
            <section>
              <img
                src={"/product/sono/" + SONO_CONTENT_IMAGE[field1][1]}
                alt={`img-${formSnapshot?.ImageRightUrl}`}
                width={300}
                height={220}
                style={{ objectFit: "contain", backgroundColor: "#c0b6b6ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={"www.home-care.vn"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Cấu trúc giải phẫu"}
                </a>
              </p>
            </section>
          </div>

          <h3
            style={{
              textAlign: "left",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              marginBottom: 0,
              marginTop: 20,
            }}
          >
            {translateLabel(
              languageTranslate,
              "imagingFindings",
              false
            ).toUpperCase()}
          </h3>

          <div style={{ marginTop: 0 }}>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13,
                margin: 0,
                padding: 0,
                color: "#333",
              }}
            >
              {SONO_CONTENT[field1]}
            </pre>
          </div>

          <h3
            style={{
              textAlign: "left",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              marginBottom: 0,
              marginTop: 20,
            }}
          >
            {"KẾT LUẬN CHẨN ĐOÁN"}
          </h3>

          {fieldList.map((fieldName, fieldIdx) => {
            let parents = rowsByField[fieldName] || [];
            parents = parents.filter(
              (p) => p.statuses[0] != "Không thấy bất thường"
            );
            const hasSelected = parents.some((p) => p.statuses?.length > 0);
            if (!hasSelected) return null;

            return (
              <div key={fieldIdx} style={{ marginTop: 20 }}>
                {/* ==== FIELD TITLE ==== */}
                <h2
                  style={{
                    color: "#2f6db8",
                    margin: "10px 0 12px",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {fieldName}
                </h2>

                <Card
                  style={{
                    background: "#f7f8fa",
                    borderRadius: 10,
                    padding: "0px 20px",
                  }}
                >
                  {parents
                    .filter((p) => p.statuses?.length > 0)
                    .map((parent, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          borderBottom: "1px solid #eee",
                          fontSize: 13,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ fontSize: 13 }}>
                            <b>Cấu trúc:</b> {parent.structure}
                          </div>

                          <div style={{ fontSize: 13 }}>
                            <b>Trạng thái:</b>{" "}
                            {parent.statuses.map((st) => (
                              <span
                                key={st}
                                style={{
                                  background: "#e5f0ff",
                                  color: "#2f6db8",
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  marginRight: 6,
                                  display: "inline-block",
                                }}
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>

                        {parent.children?.map((child, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              marginLeft: 16,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <b>Ở vị trí:</b> {child.position || "—"}
                            </div>

                            <div>
                              <b>Kích thước:</b>{" "}
                              {child.size ? `${child.size} mm` : "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                </Card>
              </div>
            );
          })}

          <Divider />

          {/* Parse JSON kết quả */}
          {(() => {
            if (!ket_qua_chan_doan || ket_qua_chan_doan.length === 0)
              return <i>Không có kết quả.</i>;

            const grouped = ket_qua_chan_doan.reduce((acc, item) => {
              if (!acc[item.field1]) acc[item.field1] = [];
              acc[item.field1].push(item);
              return acc;
            }, {});

            return Object.entries(grouped).map(([field, items], idx) => (
              <div key={idx} style={{ marginBottom: 14 }}>
                {/* Dẫn đầu */}
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  • Hình ảnh siêu âm {field}
                </p>

                {/* Các dòng kết luận con */}
                {items.map((item, childIdx) => (
                  <p
                    key={childIdx}
                    style={{
                      margin: "2px 0 0 16px",
                    }}
                  >
                    {item.text.replace(`Hình ảnh siêu âm ${field}`, "").trim()}
                  </p>
                ))}
              </div>
            ));
          })()}

          <PrintItem
            label={translateLabel(
              languageTranslate,
              "icd10Classification",
              false
            )}
            value={formSnapshot?.icd10}
          />
          <PrintItem
            label={translateLabel(
              languageTranslate,
              "gradingClassification",
              false
            )}
            value={formSnapshot?.phan_do_loai}
          />
          <PrintItem
            label={translateLabel(
              languageTranslate,
              "differentialDiagnosis",
              false
            )}
            value={formSnapshot?.chan_doan_phan_biet}
          />

          <h3
            style={{
              textAlign: "left",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              marginBottom: 0,
              marginTop: 20,
            }}
          >
            {"KHUYẾN NGHỊ VÀ TƯ VẤN"}
          </h3>

          <div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13,
                margin: 0,
                padding: 0,
                color: "#333",
              }}
            >
              {`
• Khám Bác sĩ chuyên khoa
• Tái khám định kỳ theo hướng dẫn của Bác sĩ
• Phối hợp thêm: xét nghiệm, siêu âm / chụp X quang /chụp CLVT/ chụp MRI
              `}
            </pre>
          </div>

          <h3
            style={{
              textAlign: "left",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              marginBottom: 0,
              marginTop: 20,
            }}
          >
            {"HÌNH ẢNH MINH HỌA"}
          </h3>

          <>
            <h3
              style={{
                textAlign: "left",
                color: "#2f6db8",
                margin: 0,
                padding: 0,
                marginBottom: 0,
                marginTop: 20,
              }}
            >
              {translateLabel(languageTranslate, "doctor", false).toUpperCase()}
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <section
                style={{
                  marginTop: 10,
                }}
              >
                <div style={{ display: "flex", marginBottom: 6, fontSize: 14 }}>
                  <div style={{ width: 150 }}>
                    <strong>
                      {translateLabel(languageTranslate, "fullName", false)}:
                    </strong>
                  </div>
                  {[
                    doctor.academic_title ? `${doctor.academic_title}.` : null,
                    doctor.degree ? `${doctor.degree}.` : null,
                    doctor.full_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </div>
                <div style={{ display: "flex", marginBottom: 6, fontSize: 14 }}>
                  <div style={{ width: 150 }}>
                    <strong>
                      {translateLabel(languageTranslate, "phone", false)}:
                    </strong>
                  </div>
                  {doctor.phone_number}
                </div>
                <div style={{ display: "flex", marginBottom: 6, fontSize: 14 }}>
                  <div style={{ width: 150 }}>
                    <strong>
                      {" "}
                      {translateLabel(languageTranslate, "email", false)}:
                    </strong>
                  </div>
                  {doctor?.id_user_user?.email || user.email}
                </div>
                <div style={{ display: "flex", marginBottom: 6, fontSize: 14 }}>
                  <div style={{ width: 150 }}>
                    <strong>
                      {translateLabel(languageTranslate, "time", false)}:
                    </strong>
                  </div>
                  {dayjs(formSnapshot.createdAt).format("DD-MM-YYYY HH:mm")}
                </div>
              </section>
              <section>
                <h4 style={{ padding: 0, margin: 0, marginBottom: 10 }}>
                  Chữ ký
                </h4>
                <img
                  src={doctor?.signature_url}
                  alt=""
                  width={100}
                  height={100}
                />
              </section>
              <section>
                <h4 style={{ padding: 0, margin: 0, marginBottom: 10 }}>
                  Ảnh đại diện
                </h4>

                <img src={doctor?.avatar_url} alt="" width={100} height={100} />
              </section>
            </div>
          </>
        </Card>
      </div>
      <FormActionBar
        onPrint={() => handlePrint(printRef)}
        actionKeys={["print"]}
        editId={editId}
        approvalStatus={approvalStatus}
      />
    </div>
  );
};

export default PreviewSono;
