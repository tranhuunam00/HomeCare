import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Divider, Image } from "antd";

import { translateLabel } from "../../../constant/translate.report";

const safeTranslate = (lang = "vi", key = "", uppercase = true) => {
  try {
    if (typeof translateLabel === "function") {
      return safeTranslate(lang, key, uppercase);
    }
  } catch (err) {}
  return uppercase ? String(key || "").toUpperCase() : String(key || "");
};

import styles from "./PrintPreviewVer3NotDataDiagnose.module.scss";
import "suneditor/dist/css/suneditor.min.css";
import dayjs from "dayjs";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import useVietnamAddress from "../../../hooks/useVietnamAddress";
import FormActionBar from "../../formver2/component/FormActionBar";
import { handlePrint } from "../../formver2/utils";
import PrintHeaderFromCustom from "../../products/TemplatePrint/print/PrintHeaderFromCustom";
import LegacyPrintHeader from "../../products/TemplatePrint/print/LegacyPrintHeader";
import {
  CAN_THIEP_GROUP_CODE,
  cleanOptionalStr,
  examPartName,
} from "../formver3.constant";
import { PAGE_PADDING_RIGHT } from "../../products/TemplatePrint/Setting/constant.setting.print";
import DoctorResultSection from "./DoctorResultSection/DoctorResultSection";
import API_CALL from "../../../services/axiosClient";

const colSTT = { width: 60, textAlign: "center" };

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
  languageTranslate,
  imagingRows,
  isFreeText = false,
  freeTextContent = "",
  selectedExamPart,
  isOnLyContent = false,
  setPreviewOpen,
  styleCustomParent = {},
  patientDiagnose,
}) => {
  const { doctor, selectedPatientDiagnose } = useGlobalAuth();
  const currentPatient = patientDiagnose || selectedPatientDiagnose;

  const [previewImageOpen, setPreviewImageOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

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
        fontSize: 15,
        lineHeight: 1.35,
        ...stylesCustom,
        ...styleCustomParent,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          minWidth: 16,
          flexShrink: 0,
          borderRadius: "50%",
          border: "2px solid #368df7ff",
          display: "inline-flex",
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
      <span>{label}</span>
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
          flexShrink: 0,
          ...styleCustomParent,
        }}
      >
        {label}:
      </p>
    );
  };

  const PrintItem = ({ label, value, minWidth, valueStyle }) => {
    const cleanVal = cleanOptionalStr(value);
    if (!cleanVal) return null;
    return (
      <div
        className={styles.printItem}
        style={{
          marginBottom: 4,
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
            wordBreak: "break-word",
            ...valueStyle,
            ...styleCustomParent,
          }}
        >
          {cleanVal}
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
    if (currentPatient?.province_code) {
      setSelectedProvince((prev) =>
        prev === currentPatient.province_code
          ? prev
          : currentPatient.province_code
      );
    }
  }, [currentPatient?.province_code]);

  const provinceName =
    provinces.find((p) => p.code == currentPatient?.province_code)
      ?.name || currentPatient?.province_code;

  const wardName =
    wards.find((w) => w.code == currentPatient?.ward_code)?.name ||
    currentPatient?.ward_code;

  const abnormalRows = imagingRows?.filter((row) => row.status === "abnormal");

  return (
    <div>
      <div ref={printRef} className={styles.wrapper}>
        <Card
          bordered={false}
          className={styles.a4Page}
          style={{ padding: !isOnLyContent ? PAGE_PADDING_RIGHT : 0 }}
          styles={{ body: { padding: 0 } }}
        >
          {!isOnLyContent && isUse && (
            /* Trên Desktop và khi In (@media print) hiển thị Header chuẩn. Trên mobile màn hình ẩn để tinh gọn. */
            <div className={styles.desktopPrintHeader}>
              <PrintHeaderFromCustom
                printTemplate={printTemplate}
                fallback={
                  <LegacyPrintHeader
                    printTemplate={printTemplate}
                    languageTranslate={languageTranslate}
                  />
                }
              />
            </div>
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
              {safeTranslate(
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
              examPartName(
                selectedTemplateService,
                languageTranslate,
              )?.toUpperCase() ||
              examPartName(
                templateServices?.find(
                  (t) => t.id == formSnapshot.id_template_service,
                ),
                languageTranslate,
              )?.toUpperCase()
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
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                {safeTranslate(
                  languageTranslate,
                  "administrativeInfo",
                  false,
                ).toUpperCase()}
              </h3>

              <div className={styles.adminGrid}>
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "fullName",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.name}
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "gender",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.gender}
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "age",
                    false,
                  ).toUpperCase()}
                  value={
                    currentPatient?.birth_year
                      ? `${Math.max(0, new Date().getFullYear() - Number(currentPatient.birth_year))} (${currentPatient.birth_year})`
                      : ""
                  }
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "nationality",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.countryCode}
                />
                <div className={styles.adminFullRow}>
                  <PrintItem
                    label={safeTranslate(
                      languageTranslate,
                      "address",
                      false,
                    ).toUpperCase()}
                    value={[
                      currentPatient?.address,
                      wardName,
                      provinceName,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "phone",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.phoneNumber}
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "patientId",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.PID}
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "email",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.email}
                />
                <PrintItem
                  label={safeTranslate(
                    languageTranslate,
                    "sid",
                    false,
                  ).toUpperCase()}
                  value={currentPatient?.SID}
                />
                <div className={styles.adminFullRow}>
                  <PrintItem
                    label={safeTranslate(
                      languageTranslate,
                      "clinical",
                      false,
                    ).toUpperCase()}
                    value={currentPatient?.Indication}
                  />
                </div>
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
                marginBottom: 10,
                marginTop: 20,
              }}
            >
              {safeTranslate(languageTranslate, "QUY TRÌNH KỸ THUẬT", true)}
            </h3>
          )}
          {!isOnLyContent && (
            <PrintItem
              minWidth={160}
              label={safeTranslate(languageTranslate, "Chỉ định", false)}
              value={
                examPartName(
                  selectedTemplateService,
                  languageTranslate,
                )?.toUpperCase() +
                " - " +
                examPartName(selectedExamPart, languageTranslate)?.toUpperCase()
              }
            />
          )}

          <PrintItem
            minWidth={160}
            label={safeTranslate(
              languageTranslate,
              "Kỹ thuật thực hiện",
              false,
            )}
            value={formSnapshot.implementMethod}
          />
          <div className={styles.techRow}>
            <TextLabel
              label={safeTranslate(
                languageTranslate,
                "Tiêm thuốc đối quang",
                false,
              )}
              minWidth={160}
            />

            <div className={styles.radioGroup}>
              {!isOnLyContent ? (
                <>
                  <PrintRadio
                    checked={formSnapshot?.contrastInjection === "no"}
                    label={safeTranslate(languageTranslate, "no", false)}
                  />
                  <PrintRadio
                    checked={formSnapshot?.contrastInjection === "yes"}
                    label={safeTranslate(languageTranslate, "yes", false)}
                  />
                </>
              ) : (
                <>
                  {formSnapshot?.contrastInjection === "no" && (
                    <PrintRadio
                      checked
                      label={safeTranslate(languageTranslate, "no", false)}
                    />
                  )}
                  {formSnapshot?.contrastInjection === "yes" && (
                    <PrintRadio
                      checked
                      label={safeTranslate(languageTranslate, "yes", false)}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.techRow}>
            <TextLabel
              label={safeTranslate(
                languageTranslate,
                "Chất lượng hình ảnh",
                false,
              )}
              minWidth={160}
            />

            <div className={styles.radioGroup}>
              {!isOnLyContent ? (
                <>
                  <PrintRadio
                    checked={formSnapshot?.imageQuatity === "good"}
                    label={safeTranslate(
                      languageTranslate,
                      "Đạt yêu cầu",
                      false,
                    )}
                  />
                  <PrintRadio
                    checked={formSnapshot?.imageQuatity === "limited"}
                    label={safeTranslate(
                      languageTranslate,
                      "Đạt yêu cầu, có hạn chế",
                      false,
                    )}
                  />
                  <PrintRadio
                    checked={formSnapshot?.imageQuatity === "bad"}
                    label={safeTranslate(languageTranslate, "Không đạt", false)}
                  />
                </>
              ) : (
                <>
                  {formSnapshot?.imageQuatity === "good" && (
                    <PrintRadio
                      checked
                      label={safeTranslate(
                        languageTranslate,
                        "Đạt yêu cầu",
                        false,
                      )}
                    />
                  )}
                  {formSnapshot?.imageQuatity === "limited" && (
                    <PrintRadio
                      checked
                      label={safeTranslate(
                        languageTranslate,
                        "Đạt yêu cầu, có hạn chế",
                        false,
                      )}
                    />
                  )}
                  {formSnapshot?.imageQuatity === "bad" && (
                    <PrintRadio
                      checked
                      label={safeTranslate(
                        languageTranslate,
                        "Không đạt",
                        false,
                      )}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.techRow}>
            <TextLabel
              label={safeTranslate(
                languageTranslate,
                "Thực hiện bổ sung",
                false,
              )}
              minWidth={160}
            />

            <div className={styles.radioGroup}>
              {!isOnLyContent ? (
                <>
                  <PrintRadio
                    checked={formSnapshot?.additionalAction === "no"}
                    label={safeTranslate(languageTranslate, "no", false)}
                  />
                  <PrintRadio
                    checked={formSnapshot?.additionalAction === "extra"}
                    label={safeTranslate(languageTranslate, "Chụp thêm", false)}
                  />
                  <PrintRadio
                    checked={formSnapshot?.additionalAction === "redo"}
                    label={safeTranslate(languageTranslate, "Chụp lại", false)}
                  />
                </>
              ) : (
              <>
                {formSnapshot?.additionalAction === "no" && (
                  <PrintRadio
                    checked
                    label={safeTranslate(languageTranslate, "no", false)}
                  />
                )}
                {formSnapshot?.additionalAction === "extra" && (
                  <PrintRadio
                    checked
                    label={safeTranslate(
                      languageTranslate,
                      "Chụp thêm",
                      false,
                    )}
                  />
                )}
                {formSnapshot?.additionalAction === "redo" && (
                  <PrintRadio
                    checked
                    label={safeTranslate(languageTranslate, "Chụp lại", false)}
                  />
                )}
              </>
            )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 4 }}>
            <h3
              style={{
                textAlign: "left",
                color: "#2f6db8",
                margin: 0,
                padding: 0,
              }}
            >
              {isCanThiepGroup
                ? safeTranslate(
                    languageTranslate,
                    "QUY TRÌNH THỦ THUẬT",
                    false,
                  ).toUpperCase()
                : safeTranslate(
                    languageTranslate,
                    "imagingFindings",
                    false,
                  ).toUpperCase()}
            </h3>
          </div>

          {isFreeText ? (
            // Chế độ văn bản tự do: hiển thị HTML
            <div
              className="sun-editor-editable"
              style={{
                marginTop: 8,
                fontSize: 15,
                lineHeight: 1.6,
                ...styleCustomParent,
              }}
              dangerouslySetInnerHTML={{ __html: freeTextContent || "<p>—</p>" }}
            />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 6,
                fontSize: 15,
                ...styleCustomParent,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thUnderline, ...colSTT }}></th>
                  <th
                    style={{ ...thUnderline, width: isCanThiepGroup ? 350 : 420 }}
                  ></th>

                  {isCanThiepGroup ? (
                    <th style={thUnderline}>
                      {safeTranslate(languageTranslate, "Mô tả", false)}
                    </th>
                  ) : (
                    <>
                      <th
                        style={{
                          ...thUnderline,
                          textAlign: "center",
                          width: 100,
                          fontSize: 12,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          padding: "4px 6px",
                          ...styleCustomParent,
                        }}
                      >
                        {safeTranslate(languageTranslate, "Bình thường", false)}
                      </th>
                      <th
                        style={{
                          ...thUnderline,
                          textAlign: "center",
                          width: 100,
                          fontSize: 12,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          padding: "4px 6px",
                          ...styleCustomParent,
                        }}
                      >
                        {safeTranslate(languageTranslate, "Bất thường", false)}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(imagingRows || []).map((row, index) => (
                  <tr key={row.id || index}>
                    <td style={{ ...tdUnderlineCenter, ...colSTT }}>
                      {index + 1}
                    </td>

                    <td
                      style={{
                        ...tdUnderlineLeft,
                        width: isCanThiepGroup ? 350 : 420,
                      }}
                    >
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
          )}

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
                {safeTranslate(languageTranslate, "Mô tả chi tiết", true)}
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
            {safeTranslate(
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
            label={safeTranslate(
              languageTranslate,
              "Chẩn đoán hình ảnh",
              false,
            )}
            value={formSnapshot?.imagingDiagnosisSummary}
            valueStyle={{ fontWeight: "bold", fontSize: 15 }}
          />
          <PrintItem
            minWidth={160}
            label={safeTranslate(
              languageTranslate,
              "gradingClassification",
              false,
            )}
            value={formSnapshot?.phan_do_loai}
          />
          <PrintItem
            minWidth={160}
            label={safeTranslate(
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
              {safeTranslate(
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
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                {imageList.length
                  ? safeTranslate(
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
                  justifyContent: "space-around",
                  width: "100%",
                }}
              >
                {imageList
                  .filter((image) => image.url)
                  ?.map((item, index) => (
                    <section
                      key={index}
                      style={{
                        flex: "0 0 calc(33.333% - 11px)",
                        maxWidth: "calc(33.333% - 11px)",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={item.url || item.rawUrl}
                        alt={`img-${index}`}
                        width={300}
                        height={220}
                        onClick={() => {
                          setPreviewImage(item.url || item.rawUrl);
                          setPreviewImageOpen(true);
                        }}
                        style={{
                          objectFit: "contain",
                          backgroundColor: "#e4e4e4ff",
                          width: "100%",
                          cursor: "zoom-in",
                        }}
                      />

                      <p style={{ textAlign: "center" }}>
                        {item.caption || ""}
                      </p>
                    </section>
                  ))}

                <Image
                  style={{ display: "none" }}
                  preview={{
                    visible: previewImageOpen,
                    src: previewImage,
                    onVisibleChange: (vis) => setPreviewImageOpen(vis),
                  }}
                />
              </div>
            </>
          )}

          <DoctorResultSection
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            consultingDoctor={
              currentPatient?.id_consulting_doctor_doctor
            }
            readingDoctor={{
              ...doctor,
              ...(currentPatient?.id_receive_doctor_doctor || {}),
              avatar_url:
                currentPatient?.id_receive_doctor_doctor?.avatar_url ||
                doctor?.avatar_url,
              signature_url:
                currentPatient?.id_receive_doctor_doctor?.signature_url ||
                doctor?.signature_url,
            }}
            createdAt={formSnapshot?.createdAt}
          />
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
