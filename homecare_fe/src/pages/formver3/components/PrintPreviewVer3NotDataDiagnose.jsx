import React, { useEffect, useRef } from "react";
import { Button, Card, Divider } from "antd";

import { translateLabel } from "../../../constant/app";

import styles from "./PrintPreviewVer3NotDataDiagnose.module.scss";
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import FormActionBar from "../../formver2/component/FormActionBar";
import { handlePrint } from "../../formver2/utils";

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

const PrintCheckbox = ({ checked, label }) => (
  <span style={{ marginRight: 24 }}>
    <span style={{ fontSize: 14, marginRight: 6 }}>{checked ? "☒" : "☐"}</span>
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

const PrintItem = ({ label, value, minWidth, valueStyle }) => (
  <div
    style={{
      marginBottom: 6,
      display: "flex",
      alignItems: "flex-start",
    }}
  >
    <TextLabel label={label} minWidth={minWidth} />
    <p
      style={{
        fontSize: 14,
        margin: 0,
        padding: 0,
        whiteSpace: "pre-line",
        ...valueStyle,
      }}
    >
      {value || ""}
    </p>
  </div>
);

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

  console.log("formSnapshot", formSnapshot);

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card bordered={false} className={styles.a4Page} style={{ padding: 0 }}>
          {isUse && (
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
              <div style={{ maxWidth: "280px", flex: 8 }}>
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
            minWidth={250}
            label="Kỹ thuật thực hiện"
            value={formSnapshot.implementMethod}
          />
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Tiêm thuốc đối quang"} minWidth={250} />

            <PrintCheckbox
              checked={formSnapshot?.contrastInjection === "no"}
              label="Không"
            />
            <PrintCheckbox
              checked={formSnapshot?.contrastInjection === "yes"}
              label="Có"
            />
          </div>
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Chất lượng hình ảnh"} minWidth={250} />

            <PrintCheckbox
              checked={formSnapshot?.imageQuatity === "good"}
              label="Đạt yêu cầu"
            />
            <PrintCheckbox
              checked={formSnapshot?.imageQuatity === "limited"}
              label="Đạt yêu cầu, có hạn chế"
            />
            <PrintCheckbox
              checked={formSnapshot?.imageQuatity === "bad"}
              label="Không đạt"
            />
          </div>
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel label={"Thực hiện bổ sung"} minWidth={250} />

            <PrintCheckbox
              checked={formSnapshot?.additionalAction === "no"}
              label="Không"
            />
            <PrintCheckbox
              checked={formSnapshot?.additionalAction === "extra"}
              label="Chụp thêm"
            />
            <PrintCheckbox
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
                    <Box checked={row.status === "normal"} />
                  </td>
                  <td style={tdCenter}>
                    <Box checked={row.status === "abnormal"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
                        }}
                      >
                        {row.description || "Có bất thường"}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td style={tdLeft} colSpan={3}>
                    Chưa có dữ liệu mô tả bất thường
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
              fontSize: 18,
            }}
          >
            {formSnapshot.ketQuaChanDoan || formSnapshot.ket_qua_chan_doan}
          </p>
          <PrintItem
            minWidth={250}
            label={"Chẩn đoán hình ảnh"}
            value={formSnapshot?.imagingDiagnosisSummary}
          />
          <PrintItem
            minWidth={250}
            label={translateLabel(
              languageTranslate,
              "gradingClassification",
              false
            )}
            value={formSnapshot?.phan_do_loai}
          />
          <PrintItem
            minWidth={250}
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
            {translateLabel(
              languageTranslate,
              "recommendationsCounseling",
              false
            ).toUpperCase()}
          </h3>
          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
            }}
          >
            {formSnapshot.khuyenNghi || formSnapshot.khuyen_nghi}
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
                {translateLabel(
                  languageTranslate,
                  "illustrativeImages",
                  false
                ).toUpperCase()}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap", // Cho phép ảnh xuống dòng
                  justifyContent: "space-between",
                }}
              >
                {imageList?.map((item, index) => (
                  <section
                    key={index}
                    style={{
                      width: "33%", // Chiếm 48% chiều rộng để hiển thị 2 ảnh trong 1 hàng
                      marginBottom: "16px", // Khoảng cách giữa các ảnh
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
                        width: "100%", // Đảm bảo ảnh đầy đủ chiều rộng của ô
                      }}
                    />
                    <p style={{ textAlign: "center" }}>{item.caption || ""}</p>
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
