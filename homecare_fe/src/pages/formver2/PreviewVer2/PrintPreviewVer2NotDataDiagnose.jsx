import React, { useEffect, useRef } from "react";
import { Button, Card, Divider } from "antd";

import { translateLabel } from "../../../constant/app";

import styles from "./PrintPreviewVer2NotDataDiagnose.module.scss";
import { PrinterOutlined } from "@ant-design/icons";
import TablesSnapshotPreview from "./TablesSnapshotPreview";
import CustomSunEditor from "../../../components/Suneditor/CustomSunEditor";
import FormActionBar from "../component/FormActionBar";
import { handlePrint } from "../utils";
import InnerHTMLFormEditor from "./InnerHTMLFormEditor";
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";

const SectionTitle = ({ children }) => (
  <h3 className={styles.sectionTitle}>{children}</h3>
);

const KVRow = ({ label, value }) => (
  <div className={styles.kvRow}>
    <div className={styles.label}>{label}:</div>
    <div className={styles.value}>{value ?? "-"}</div>
  </div>
);

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
const PrintPreviewVer2NotDataDiagnose = ({
  formSnapshot,
  selectedTemplateService,
  ImageLeftUrl,
  ImageRightUrl,
  imageDescEditor,
  editId,
  isUse = false,
  imageList = [],
  printTemplate = {},
  doctor = {},
  languageTranslate,
  approvalStatus,
}) => {
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
            {translateLabel(
              languageTranslate,
              "technicalProtocol",
              false
            ).toUpperCase()}
          </h3>

          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <PrintItem
                label={"TÊN MẪU"}
                value={
                  formSnapshot?.doctor_use_form_ver2_name ||
                  currentFormVer2Name?.name
                }
              /> */}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <PrintItem
                label={"MÃ SỐ ĐỊNH DANH MẪU"}
                value={currentFormVer2Name?.code}
              /> */}
              {/* <PrintItem
                label={"KẾT LUẬN CỦA MẪU"}
                value={formSnapshot?.ket_luan || formSnapshot?.ket_luan_url}
              /> */}
              {/* <PrintItem
                label={"NGÀY THỰC HIỆN"}
                value={dayjs(
                  initialSnap?.apiData?.createdAt || new Date()
                ).format("DD-MM-YYYY")}
              /> */}
            </div>
          </>

          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
            }}
          >
            {formSnapshot.quyTrinh || formSnapshot.quy_trinh_url}
          </p>
          <Divider />

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
                style={{ objectFit: "contain", backgroundColor: "#c0b6b6ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={
                    formSnapshot?.ImageLeftDescLink ||
                    formSnapshot.image_form_ver2s?.find((i) => i.kind == "left")
                      ?.link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageLeftDesc ||
                    formSnapshot.image_form_ver2s?.find((i) => i.kind == "left")
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
                style={{ objectFit: "contain", backgroundColor: "#c0b6b6ff" }}
              />
              <p style={{ textAlign: "center" }}>
                <a
                  href={
                    formSnapshot?.ImageRightDescLink ||
                    formSnapshot.image_form_ver2s?.find(
                      (i) => i.kind == "right"
                    )?.link
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formSnapshot?.ImageRightDesc ||
                    formSnapshot.image_form_ver2s?.find(
                      (i) => i.kind == "right"
                    )?.desc}
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

          {/* <TablesSnapshotPreview tablesSnapshot={tablesSnapshot} /> */}
          <InnerHTMLFormEditor data={imageDescEditor} />

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
        keys={["print"]}
        editId={editId}
        approvalStatus={approvalStatus}
      />
    </div>
  );
};

export default PrintPreviewVer2NotDataDiagnose;
