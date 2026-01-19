import React, { useEffect, useRef } from "react";
import { Button, Card, Divider } from "antd";

import { translateLabel } from "../../../constant/app";

import styles from "./PrintPreviewVer3NotDataDiagnose.module.scss";
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import FormActionBar from "../../formver2/component/FormActionBar";
import { handlePrint } from "../../formver2/utils";
import PrintHeaderFromCustom from "../../products/TemplatePrint/print/PrintHeaderFromCustom";
import LegacyPrintHeader from "../../products/TemplatePrint/print/LegacyPrintHeader";

const colSTT = { width: 60 };
const colStructure = { width: 220 };
const thStyle = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
  fontWeight: 600,
};

const tdCenter = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
};

const tdLeft = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "left",
};

const Box = ({ checked }) => (
  <span style={{ fontSize: 18 }}>{checked ? "☒" : "☐"}</span>
);

const Circle = ({ checked }) => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: checked ? "2px solid #368df7ff" : "2px solid #368df7ff",
      backgroundColor: checked ? "#368df7ff" : "transparent",
      boxShadow: checked ? "inset 0 0 0 6px #368df7ff" : "none",
    }}
  />
);

const PrintRadio = ({ checked, label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      marginRight: 24,
      fontSize: 14,
    }}
  >
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: checked ? "2px solid #368df7ff" : "2px solid #368df7ff",
        backgroundColor: checked ? "#368df7ff" : "transparent",
        boxShadow: checked ? "inset 0 0 0 6px #368df7ff" : "none",
        marginRight: 6,
      }}
    />
    {label}
  </span>
);

const TextLabel = ({ label, minWidth }) => {
  return (
    <p
      style={{
        fontSize: 14,
        fontWeight: 600,
        margin: 0,
        padding: 0,
        marginRight: 10,
        minWidth: minWidth,
      }}
    >
      {label}:
    </p>
  );
};

const PrintItem = ({ label, value, minWidth, valueStyle }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 6, display: "flex", alignItems: "flex-start" }}>
      <TextLabel label={label} minWidth={minWidth} />
      <p
        style={{
          fontSize: 14,
          margin: 0,
          padding: 0,
          whiteSpace: "pre-wrap",
          ...valueStyle,
        }}
      >
        {value || ""}
      </p>
    </div>
  );
};

/* ---------- Main ---------- */
const PrintPreviewVer3NotDataDiagnose = ({
  formSnapshot,
  selectedTemplateService,
  editId,
  isUse = false,
  imageList = [],
  printTemplate = {},
  doctor = {},
  languageTranslate,
  approvalStatus,
  imagingRows,
  selectedExamPart,
}) => {
  console.log("approvalStatus", approvalStatus);
  const { templateServices, user } = useGlobalAuth();
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

  console.log(
    "formSnapshot?.imagingDiagnosisSummary",
    formSnapshot?.imagingDiagnosisSummary
  );

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card bordered={false} className={styles.a4Page} style={{ padding: 0 }}>
          {isUse && (
            <PrintHeaderFromCustom
              printTemplate={printTemplate}
              fallback={
                <LegacyPrintHeader
                  printTemplate={printTemplate}
                  languageTranslate={languageTranslate}
                />
              }
            />
          )}

          <h1
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
            }}
          >
            {translateLabel(
              languageTranslate,
              "Result_Report",
              false
            ).toUpperCase()}
          </h1>
          <h2
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
              fontSize: 25,
            }}
          >{`${
            selectedTemplateService?.name?.toUpperCase() ||
            templateServices
              ?.find((t) => t.id == formSnapshot.id_template_service)
              ?.name?.toUpperCase()
          }`}</h2>
          {isUse && (
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
          )}
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
            {"QUY TRÌNH KỸ THUẬT".toUpperCase()}
          </h3>

          <PrintItem
            minWidth={160}
            label="Phân hệ"
            value={selectedTemplateService?.name}
          />
          <PrintItem
            minWidth={160}
            label="Bộ phận"
            value={selectedExamPart?.name}
          />

          <PrintItem
            minWidth={160}
            label="Kỹ thuật thực hiện"
            value={formSnapshot.implementMethod}
          />
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Tiêm thuốc đối quang"} minWidth={160} />

            <PrintRadio
              checked={formSnapshot?.contrastInjection === "no"}
              label="Không"
            />
            <PrintRadio
              checked={formSnapshot?.contrastInjection === "yes"}
              label="Có"
            />
          </div>
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Chất lượng hình ảnh"} minWidth={160} />

            <PrintRadio
              checked={formSnapshot?.imageQuatity === "good"}
              label="Đạt yêu cầu"
            />
            <PrintRadio
              checked={formSnapshot?.imageQuatity === "limited"}
              label="Đạt yêu cầu, có hạn chế"
            />
            <PrintRadio
              checked={formSnapshot?.imageQuatity === "bad"}
              label="Không đạt"
            />
          </div>
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Thực hiện bổ sung"} minWidth={160} />

            <PrintRadio
              checked={formSnapshot?.additionalAction === "no"}
              label="Không"
            />
            <PrintRadio
              checked={formSnapshot?.additionalAction === "extra"}
              label="Chụp thêm"
            />
            <PrintRadio
              checked={formSnapshot?.additionalAction === "redo"}
              label="Chụp lại"
            />
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

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ ...thStyle, ...colSTT }}>STT</th>
                <th style={{ ...thStyle, ...colStructure }}>Cấu trúc</th>
                <th style={thStyle}>Bình thường</th>
                <th style={thStyle}>Bất thường</th>
              </tr>
            </thead>
            <tbody>
              {imagingRows.map((row, index) => (
                <tr key={row.id || index}>
                  <td style={{ ...tdCenter, ...colSTT }}>{index + 1}</td>
                  <td style={{ ...tdLeft, ...colStructure }}>{row.name}</td>
                  <td style={tdCenter}>
                    <Circle checked={row.status === "normal"} />
                  </td>
                  <td style={tdCenter}>
                    <Circle checked={row.status === "abnormal"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {imagingRows?.filter((row) => row.status === "abnormal").length ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 20,
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={thStyle} colSpan={3}>
                    Mô tả các chi tiết bất thường
                  </th>
                </tr>
              </thead>
              <tbody>
                {imagingRows &&
                imagingRows.filter((row) => row.status === "abnormal").length >
                  0 ? (
                  imagingRows
                    .filter((row) => row.status === "abnormal")
                    .map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td style={{ ...tdCenter, ...colSTT }}>{idx + 1}</td>
                        <td style={{ ...tdLeft, ...colStructure }}>
                          {row.name}:
                        </td>
                        <td
                          style={{
                            ...tdLeft,
                            whiteSpace: "pre-line",
                            fontSize: 14,
                          }}
                        >
                          {row.description || "Có bất thường"}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td style={tdLeft} colSpan={3}>
                      ""
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            ""
          )}
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
              "impression",
              false
            ).toUpperCase()}
          </h3>
          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {formSnapshot.ketQuaChanDoan || formSnapshot.ket_qua_chan_doan}
          </p>
          <PrintItem
            minWidth={160}
            label={"Chẩn đoán hình ảnh"}
            value={formSnapshot?.imagingDiagnosisSummary}
            valueStyle={{ fontWeight: "bold", fontSize: 13 }}
          />
          {formSnapshot?.phan_do_loai && (
            <PrintItem
              minWidth={160}
              label={translateLabel(
                languageTranslate,
                "gradingClassification",
                false
              )}
              value={formSnapshot?.phan_do_loai}
            />
          )}
          <PrintItem
            minWidth={160}
            label={translateLabel(
              languageTranslate,
              "differentialDiagnosis",
              false
            )}
            value={formSnapshot?.chan_doan_phan_biet}
          />

          {formSnapshot.khuyen_nghi && (
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
                "recommendationsCounseling",
                false
              ).toUpperCase()}
            </h3>
          )}
          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
            }}
          >
            {formSnapshot.khuyen_nghi}
          </p>

          {isUse && (
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
                {imageList.length
                  ? translateLabel(
                      languageTranslate,
                      "illustrativeImages",
                      false
                    ).toUpperCase()
                  : ""}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {imageList
                  .filter((image) => image.url)
                  ?.map((item, index) => (
                    <section
                      key={index}
                      style={{
                        width: "33%",
                        marginBottom: "16px",
                      }}
                    >
                      <img
                        src={item.url || item.rawUrl}
                        alt={`img-${index}`}
                        width={300}
                        height={220}
                        style={{
                          objectFit: "contain",
                          backgroundColor: "#e4e4e4ff",
                          width: "100%",
                        }}
                      />
                      <p style={{ textAlign: "center" }}>
                        {item.caption || ""}
                      </p>
                    </section>
                  ))}
              </div>
            </>
          )}
          {isUse && (
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
                {translateLabel(
                  languageTranslate,
                  "doctor",
                  false
                ).toUpperCase()}
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
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>
                        {translateLabel(languageTranslate, "fullName", false)}:
                      </strong>
                    </div>
                    {[
                      doctor.academic_title
                        ? `${doctor.academic_title}.`
                        : null,
                      doctor.degree ? `${doctor.degree}.` : null,
                      doctor.full_name,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>
                        {translateLabel(languageTranslate, "phone", false)}:
                      </strong>
                    </div>
                    {doctor.phone_number}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>
                        {" "}
                        {translateLabel(languageTranslate, "email", false)}:
                      </strong>
                    </div>
                    {doctor?.id_user_user?.email || user.email}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
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

                  <img
                    src={doctor?.avatar_url}
                    alt=""
                    width={100}
                    height={100}
                  />
                </section>
              </div>
            </>
          )}
        </Card>
      </div>
      <FormActionBar
        onPrint={() => handlePrint(printRef)}
        actionKeys={["print"]}
        editId={editId}
        approvalStatus={"approved"}
      />
    </div>
  );
};

export default PrintPreviewVer3NotDataDiagnose;
