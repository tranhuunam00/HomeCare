import React from "react";
import dayjs from "dayjs";
import { translateLabel } from "../../../../constant/app";

const DoctorResultSection = ({
  consultingDoctor,
  readingDoctor,
  createdAt,
  languageTranslate,
}) => {
  const hasConsultingDoctor = !!consultingDoctor?.id;

  const titleStyle = {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 1.2,
  };

  const valueStyle = {
    fontSize: 13,
    lineHeight: 1.3,
  };

  const renderDoctorInfo = (
    doctor,
    isReadingDoctor = false,
    isSingle = false,
  ) => {
    if (!doctor) {
      return (
        <div
          style={{
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontStyle: "italic",
            fontSize: 11,
          }}
        >
          Không có dữ liệu
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: 90,
          borderTop: "1px solid #cfd4dc",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #cfd4dc",
              height: 72,
              maxHeight: 72,
              minHeight: 72,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 72,
                maxHeight: 72,
                borderRight: "1px solid #cfd4dc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2px 8px",
                overflow: "hidden",
              }}
            >
              {doctor.signature_url ? (
                <img
                  src={doctor.signature_url}
                  alt="Chữ ký"
                  style={{
                    maxHeight: 58,
                    maxWidth: "90%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ color: "#9ca3af", fontSize: 11, fontStyle: "italic" }}>
                  Chữ ký bác sĩ
                </div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                height: 72,
                maxHeight: 72,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 8px",
                overflow: "hidden",
              }}
            >
              {doctor.avatar_url ? (
                <img
                  src={doctor.avatar_url}
                  alt="Ảnh bác sĩ"
                  style={{
                    width: 58,
                    height: 58,
                    minWidth: 58,
                    minHeight: 58,
                    maxWidth: 58,
                    maxHeight: 58,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #d1d5db",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ color: "#9ca3af", fontSize: 11, fontStyle: "italic" }}>
                  Ảnh đại diện
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              minHeight: 42,
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "6px ",
                borderRight: "1px solid #cfd4dc",
              }}
            >
              <div style={titleStyle}>
                {translateLabel(
                  languageTranslate,
                  "Họ tên, học hàm, học vị",
                  false,
                )}
              </div>

              <div style={valueStyle}>
                {[
                  doctor.academic_title ? `${doctor.academic_title}.` : null,
                  doctor.degree ? `${doctor.degree}.` : null,
                  doctor.full_name,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: "6px",
              }}
            >
              <div style={titleStyle}>
                {isReadingDoctor
                  ? translateLabel(
                      languageTranslate,
                      "Thời gian thực hiện",
                      false,
                    )
                  : translateLabel(languageTranslate, "Nơi công tác", false)}
              </div>

              <div style={valueStyle}>
                {isReadingDoctor
                  ? dayjs(createdAt).format("DD-MM-YYYY HH:mm")
                  : doctor?.clinic?.name || "---"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasConsultingDoctor
            ? "repeat(auto-fit, minmax(260px, 1fr))"
            : "1fr",
          border: "1px solid #cfd4dc",
        }}
      >
        {/* LEFT */}
        {hasConsultingDoctor && (
          <div
            style={{
              borderRight: "1px solid #cfd4dc",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                padding: 6,
                margin: 0,
                fontWeight: 750,
                color: "rgb(47, 109, 184)",
                fontSize: 15,
              }}
            >
              {translateLabel(languageTranslate, "BAC SI HOI CHAN", false)}
            </h3>

            {renderDoctorInfo(consultingDoctor)}
          </div>
        )}

        {/* RIGHT */}
        <div>
          <h3
            style={{
              textAlign: "center",
              padding: 6,
              margin: 0,
              fontWeight: 750,
              color: "rgb(47, 109, 184)",
              fontSize: 15,
            }}
          >
            {translateLabel(languageTranslate, "BAC SI DOC KET QUA", false)}
          </h3>

          {renderDoctorInfo(readingDoctor, true, !hasConsultingDoctor)}
        </div>
      </div>
    </div>
  );
};

export default DoctorResultSection;
