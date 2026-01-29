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
import { CAN_THIEP_GROUP_CODE } from "../formver3.constant";
import { PAGE_PADDING_RIGHT } from "../../products/TemplatePrint/Setting/constant.setting.print";

const colSTT = { width: 60, textAlign: "center" };
const colStructure = { width: 220 };

const thUnderline = {
  borderBottom: "1px solid #000",
  padding: "6px 8px",
  textAlign: "left",
  fontWeight: 600,
};

const tdUnderlineCenter = {
  borderBottom: "1px solid #000",
  padding: "6px 8px",
  textAlign: "center",
};

const tdUnderlineLeft = {
  borderBottom: "1px solid #000",
  padding: "6px 8px",
  textAlign: "left",
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
  isOnLyContent = false,
  setPreviewOpen,
  styleCustomParent = {},
  is_print = false,
}) => {
  console.log("approvalStatus", approvalStatus);

  const Circle = ({ checked }) =>
    !checked ? null : (
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid #368df7ff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: "bold",
          color: "#368df7ff",
          ...styleCustomParent,
        }}
      >
        {checked ? "✓" : ""}
      </span>
    );
  const PrintRadio = ({ checked, label, stylesCustom }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginRight: 24,
        fontSize: 15,
        ...stylesCustom,
        ...styleCustomParent,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid #368df7ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 6,
          fontSize: 12,
          color: "#368df7ff",
          fontWeight: "bold",
          ...styleCustomParent,
        }}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </span>
  );

  const TextLabel = ({ label, minWidth }) => {
    return (
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          margin: 0,
          padding: 0,
          marginRight: 10,
          minWidth: minWidth,
          ...styleCustomParent,
        }}
      >
        {label}:
      </p>
    );
  };

  const PrintItem = ({ label, value, minWidth, valueStyle }) => {
    if (!value) return null;
    return (
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
            fontSize: 15,
            margin: 0,
            padding: 0,
            whiteSpace: "pre-wrap",
            ...valueStyle,
            ...styleCustomParent,
          }}
        >
          {value || ""}
        </p>
      </div>
    );
  };

  const { templateServices, user } = useGlobalAuth();
  const printRef = useRef();
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  const resolvedTemplateService =
    selectedTemplateService ||
    templateServices?.find((t) => t.id == formSnapshot?.id_template_service);

  const isCanThiepGroup = resolvedTemplateService?.code
    ? CAN_THIEP_GROUP_CODE.includes(resolvedTemplateService.code)
    : false;
  useEffect(() => {
    setSelectedProvince(formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho);
  }, [formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho]);
  const provinceName =
    provinces.find(
      (p) => p.code == formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho,
    )?.name || formSnapshot?.benh_nhan_dia_chi_tinh_thanh_pho;

  const wardName =
    wards.find((w) => w.code == formSnapshot?.benh_nhan_dia_chi_xa_phuong)
      ?.name || formSnapshot?.benh_nhan_dia_chi_xa_phuong;

  console.log(
    "formSnapshot?.imagingDiagnosisSummary",
    formSnapshot?.imagingDiagnosisSummary,
  );

  const abnormalRows = imagingRows?.filter((row) => row.status === "abnormal");

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card
          bordered={false}
          className={styles.a4Page}
          style={{ padding: !isOnLyContent ? PAGE_PADDING_RIGHT : 0 }}
          bodyPadding={0}
        >
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

          {!isOnLyContent && (
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
                false,
              ).toUpperCase()}
            </h1>
          )}
          {!isOnLyContent && (
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
          )}
          {!isOnLyContent && isUse && (
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
                  false,
                ).toUpperCase()}
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "fullName",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_ho_ten}
                />
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "gender",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_gioi_tinh}
                />
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "age",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_tuoi}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "address",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_dia_chi_so_nha}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "district",
                    false,
                  ).toUpperCase()}
                  value={wardName}
                />

                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "province",
                    false,
                  ).toUpperCase()}
                  value={provinceName}
                />
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "nationality",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_quoc_tich}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "phone",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_dien_thoai}
                />
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "email",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_email}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "patientId",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_pid}
                />
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "sid",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_sid}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <PrintItem
                  label={translateLabel(
                    languageTranslate,
                    "clinical",
                    false,
                  ).toUpperCase()}
                  value={formSnapshot?.benh_nhan_lam_sang}
                />
              </div>
            </>
          )}
          {!isOnLyContent && (
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
              {translateLabel(languageTranslate, "QUY TRÌNH KỸ THUẬT", true)}
            </h3>
          )}
          {!isOnLyContent && (
            <PrintItem
              minWidth={160}
              label={translateLabel(languageTranslate, "Chỉ định", false)}
              value={
                selectedTemplateService?.name +
                " - " +
                selectedExamPart?.name?.toUpperCase()
              }
            />
          )}

          <PrintItem
            minWidth={160}
            label={translateLabel(
              languageTranslate,
              "Kỹ thuật thực hiện",
              false,
            )}
            value={formSnapshot.implementMethod}
          />
          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel
              label={translateLabel(
                languageTranslate,
                "Tiêm thuốc đối quang",
                false,
              )}
              minWidth={160}
            />

            {!isOnLyContent ? (
              <>
                <PrintRadio
                  checked={formSnapshot?.contrastInjection === "no"}
                  label="Không"
                  stylesCustom={{ width: 120 }}
                />
                <PrintRadio
                  checked={formSnapshot?.contrastInjection === "yes"}
                  label="Có"
                />
              </>
            ) : (
              <>
                {formSnapshot?.contrastInjection === "no" && (
                  <PrintRadio checked label="Không" />
                )}
                {formSnapshot?.contrastInjection === "yes" && (
                  <PrintRadio checked label="Có" />
                )}
              </>
            )}
          </div>

          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel
              label={translateLabel(
                languageTranslate,
                "Chất lượng hình ảnh",
                false,
              )}
              minWidth={160}
            />

            {!isOnLyContent ? (
              <>
                <PrintRadio
                  checked={formSnapshot?.imageQuatity === "good"}
                  label="Đạt yêu cầu"
                  stylesCustom={{ width: 120 }}
                />
                <PrintRadio
                  checked={formSnapshot?.imageQuatity === "limited"}
                  label="Đạt yêu cầu, có hạn chế"
                  stylesCustom={{ width: 200 }}
                />
                <PrintRadio
                  checked={formSnapshot?.imageQuatity === "bad"}
                  label="Không đạt"
                />
              </>
            ) : (
              <>
                {formSnapshot?.imageQuatity === "good" && (
                  <PrintRadio checked label="Đạt yêu cầu" />
                )}
                {formSnapshot?.imageQuatity === "limited" && (
                  <PrintRadio checked label="Đạt yêu cầu, có hạn chế" />
                )}
                {formSnapshot?.imageQuatity === "bad" && (
                  <PrintRadio checked label="Không đạt" />
                )}
              </>
            )}
          </div>

          <div style={{ display: "flex", marginBottom: 4 }}>
            <TextLabel
              label={translateLabel(
                languageTranslate,
                "Thực hiện bổ sung",
                false,
              )}
              minWidth={160}
            />

            {!isOnLyContent ? (
              <>
                <PrintRadio
                  checked={formSnapshot?.additionalAction === "no"}
                  label="Không"
                  stylesCustom={{ width: 120 }}
                />
                <PrintRadio
                  checked={formSnapshot?.additionalAction === "extra"}
                  label="Chụp thêm"
                  stylesCustom={{ width: 200 }}
                />
                <PrintRadio
                  checked={formSnapshot?.additionalAction === "redo"}
                  label="Chụp lại"
                />
              </>
            ) : (
              <>
                {formSnapshot?.additionalAction === "no" && (
                  <PrintRadio checked label="Không" />
                )}
                {formSnapshot?.additionalAction === "extra" && (
                  <PrintRadio checked label="Chụp thêm" />
                )}
                {formSnapshot?.additionalAction === "redo" && (
                  <PrintRadio checked label="Chụp lại" />
                )}
              </>
            )}
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
            {isCanThiepGroup
              ? "QUY TRÌNH THỦ THUẬT"
              : translateLabel(
                  languageTranslate,
                  "imagingFindings",
                  false,
                ).toUpperCase()}
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
              fontSize: 15,
              ...styleCustomParent,
            }}
          >
            <thead>
              <tr>
                <th style={{ ...thUnderline, ...colSTT }}></th>
                <th style={{ ...thUnderline, ...colStructure }}></th>

                {isCanThiepGroup ? (
                  <th style={thUnderline}>Mô tả</th>
                ) : (
                  <>
                    <th
                      style={{
                        ...thUnderline,
                        textAlign: "center",
                        ...styleCustomParent,
                      }}
                    >
                      Bình thường
                    </th>
                    <th
                      style={{
                        ...thUnderline,
                        textAlign: "center",
                        ...styleCustomParent,
                      }}
                    >
                      Bất thường
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {imagingRows.map((row, index) => (
                <tr key={row.id || index}>
                  <td style={{ ...tdUnderlineCenter, ...colSTT }}>
                    {index + 1}
                  </td>

                  <td style={{ ...tdUnderlineLeft, ...colStructure }}>
                    {row.name}
                  </td>

                  {isCanThiepGroup ? (
                    <td
                      style={{
                        ...tdUnderlineLeft,
                        whiteSpace: "pre-line",
                        fontSize: 15,
                        ...styleCustomParent,
                      }}
                    >
                      {row.description || ""}
                    </td>
                  ) : (
                    <>
                      <td style={tdUnderlineCenter}>
                        <Circle checked={row.status === "normal"} />
                      </td>
                      <td style={tdUnderlineCenter}>
                        <Circle checked={row.status === "abnormal"} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {!isCanThiepGroup && abnormalRows?.length > 0 && (
            <>
              <h3
                style={{
                  textAlign: "left",
                  marginTop: 20,
                  marginBottom: 8,
                  fontSize: 16,
                }}
              >
                {translateLabel(languageTranslate, "Mô tả chi tiết", true)}
              </h3>

              <ul
                style={{
                  paddingLeft: 24,
                  margin: 0,
                  fontSize: 15,
                }}
              >
                {abnormalRows.map((row, idx) => (
                  <li
                    key={row.id || idx}
                    style={{ marginBottom: 10, display: "flex" }}
                  >
                    <strong style={{ minWidth: 230 }}>{row.name}:</strong>
                    {row.description && (
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {row.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
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
              "impression",
              false,
            ).toUpperCase()}
          </h3>
          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            {formSnapshot.ketQuaChanDoan || formSnapshot.ket_qua_chan_doan}
          </p>
          <PrintItem
            minWidth={160}
            label={translateLabel(languageTranslate, "Conclusion", false)}
            value={formSnapshot?.imagingDiagnosisSummary}
            valueStyle={{ fontWeight: "bold", fontSize: 15 }}
          />
          {formSnapshot?.phan_do_loai && (
            <PrintItem
              minWidth={160}
              label={translateLabel(
                languageTranslate,
                "gradingClassification",
                false,
              )}
              value={formSnapshot?.phan_do_loai}
            />
          )}
          <PrintItem
            minWidth={160}
            label={translateLabel(
              languageTranslate,
              "differentialDiagnosis",
              false,
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
                false,
              ).toUpperCase()}
            </h3>
          )}
          <p
            className={styles.paragraph}
            style={{
              whiteSpace: "pre-line",
              fontSize: 15,
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
                      false,
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
                  false,
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
                    style={{ display: "flex", marginBottom: 6, fontSize: 15 }}
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
                    style={{ display: "flex", marginBottom: 6, fontSize: 15 }}
                  >
                    <div style={{ width: 150 }}>
                      <strong>
                        {translateLabel(languageTranslate, "phone", false)}:
                      </strong>
                    </div>
                    {doctor.phone_number}
                  </div>
                  <div
                    style={{ display: "flex", marginBottom: 6, fontSize: 15 }}
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
                    style={{ display: "flex", marginBottom: 6, fontSize: 15 }}
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
                  <img
                    src={doctor?.avatar_url}
                    alt=""
                    width={120}
                    height={120}
                  />
                </section>
              </div>
            </>
          )}
        </Card>
      </div>
      {!isOnLyContent && (
        <FormActionBar
          onPrint={() => handlePrint(printRef)}
          onExit={() => setPreviewOpen(false)}
          actionKeys={["print", "exit"]}
          editId={editId}
          approvalStatus={"approved"}
        />
      )}
    </div>
  );
};

export default PrintPreviewVer3NotDataDiagnose;
