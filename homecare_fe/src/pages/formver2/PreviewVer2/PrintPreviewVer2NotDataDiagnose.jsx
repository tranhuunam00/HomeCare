import React, { useEffect, useRef } from "react";
import { Button, Card, Divider } from "antd";

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

const LABELS_ADDON = ADMIN_INFO_LABELS;

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
    <p style={{ fontSize: 14, margin: 0, padding: 0 }}>{value || "-"}</p>
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
  isUse = false,
  imageList = [],
  printTemplate = {},
  doctor = {},
}) => {
  const { examParts, templateServices, user, formVer2Names } = useGlobalAuth();
  const LABELS = ADMIN_INFO_LABELS;
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
        <Card bordered={false} className={styles.a4Page}>
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
                <p style={{ fontWeight: 600, color: "#2f6db8", fontSize: 14 }}>
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
          )}

          <h1
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
            }}
          >
            PHIẾU KẾT QUẢ
          </h1>
          <h3
            style={{
              textAlign: "center",
              color: "#2f6db8",
              margin: 0,
              padding: 0,
            }}
          >{`${
            selectedTemplateService?.name?.toUpperCase() ||
            templateServices
              ?.find((t) => t.id == formSnapshot.id_template_service)
              ?.name?.toUpperCase()
          }`}</h3>
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
                THÔNG TIN HÀNH CHÍNH
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"HỌ VÀ TÊN"}
                  value={formSnapshot?.benh_nhan_ho_ten}
                />
                <PrintItem
                  label={"GIỚI TÍNH"}
                  value={formSnapshot?.benh_nhan_gioi_tinh}
                />
                <PrintItem
                  label={"TUỔI"}
                  value={formSnapshot?.benh_nhan_tuoi}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"QUỐC TỊCH"}
                  value={formSnapshot?.benh_nhan_quoc_tich}
                />
                <PrintItem label={"TỈNH/THÀNH PHỐ"} value={provinceName} />
                <PrintItem label={"XÃ/PHƯỜNG"} value={wardName} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"SỐ NHÀ"}
                  value={formSnapshot?.benh_nhan_dia_chi_so_nha}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"ĐIỆN THOẠI"}
                  value={formSnapshot?.benh_nhan_dien_thoai}
                />
                <PrintItem
                  label={"EMAIL"}
                  value={formSnapshot?.benh_nhan_email}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"MÃ SỐ PID"}
                  value={formSnapshot?.benh_nhan_pid}
                />
                <PrintItem
                  label={"MÃ SỐ SID"}
                  value={formSnapshot?.benh_nhan_sid}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={"LÂM SÀNG"}
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
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            QUY TRÌNH KĨ THUẬT
          </h3>

          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <PrintItem
                label={"PHÂN HỆ"}
                value={
                  selectedTemplateService?.name ||
                  templateServices?.find(
                    (t) => t.id == formSnapshot.id_template_service
                  )?.name
                }
              />
              <PrintItem
                label={"BỘ PHẬN"}
                value={
                  selectedExamPart?.name ||
                  examParts?.find((t) => t.id == formSnapshot.id_exam_part)
                    ?.name
                }
              />
              <PrintItem label={"NGÔN NGỮ"} value={"Vi"} />
            </div>

            <Divider />

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

          <p className={styles.paragraph}>
            {formSnapshot.quyTrinh || formSnapshot.quy_trinh_url}
          </p>

          <TablesSnapshotPreview tablesSnapshot={tablesSnapshot} />
          <InnerHTMLFormEditor data={imageDescEditor} />

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
            KẾT LUẬN, CHẨN ĐOÁN
          </h3>
          <p className={styles.paragraph}>{formSnapshot.ketQuaChanDoan}</p>
          <PrintItem label={"PHÂN LOẠI IDC-10"} value={formSnapshot?.icd10} />
          <PrintItem
            label={"PHÂN ĐỘ, PHÂN LOẠI"}
            value={formSnapshot?.phan_do_loai}
          />
          <PrintItem
            label={"CHẨN ĐOÁN PHÂN BIỆT"}
            value={formSnapshot?.chan_doan_phan_biet}
          />

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
            KHUYẾN NGHỊ & TƯ VẤN
          </h3>
          <p className={styles.paragraph}>
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
                HÌNH ẢNH MÔ TẢ
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
                      width: "48%", // Chiếm 48% chiều rộng để hiển thị 2 ảnh trong 1 hàng
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
                    <p style={{ textAlign: "center" }}>
                      {item.caption || "Ảnh mô tả"}
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
                  marginBottom: 20,
                  marginTop: 20,
                }}
              >
                BÁC SĨ THỰC HIỆN
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <section>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>{LABELS_ADDON.full_name}:</strong>
                    </div>
                    {doctor.full_name}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>{LABELS_ADDON.phoneNumber}:</strong>
                    </div>
                    {doctor.phone_number}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>{LABELS_ADDON.time}:</strong>
                    </div>
                    {dayjs(formSnapshot.createdAt).format("DD-MM-YYYY HH:mm")}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 14 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>{LABELS_ADDON.email}:</strong>
                    </div>
                    {doctor?.id_user_user?.email}
                  </div>
                </section>
                <section>
                  <img
                    src={doctor?.signature_url}
                    alt=""
                    width={100}
                    height={100}
                  />
                </section>
                <section>
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
      />
    </div>
  );
};

export default PrintPreviewVer2NotDataDiagnose;
