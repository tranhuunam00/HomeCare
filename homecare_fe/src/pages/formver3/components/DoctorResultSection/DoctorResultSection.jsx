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
              minHeight: 52,
            }}
          >
            <div
              style={{
                flex: 1,
                borderRight: "1px solid #cfd4dc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {doctor.signature_url && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={doctor.signature_url}
                    alt=""
                    style={{
                      height: 80,
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={doctor.avatar_url}
                alt=""
                style={{
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: "1px solid #d1d5db",
                }}
              />
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
    <div style={{}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          border: "1px solid #cfd4dc",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            borderRight: "1px solid #cfd4dc",
            visibility: hasConsultingDoctor ? "visible" : "hidden",
          }}
        >
          {hasConsultingDoctor && (
            <>
              <h3
                style={{
                  textAlign: "center",
                  padding: 6,
                  fontWeight: 750,
                  color: "rgb(47, 109, 184)",
                  fontSize: 15,
                }}
              >
                {translateLabel(languageTranslate, "BAC SI HOI CHAN", false)}
              </h3>

              {renderDoctorInfo(consultingDoctor)}
            </>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ borderLeft: "1px solid #ccc" }}>
          <h3
            style={{
              textAlign: "center",
              padding: 6,
              fontWeight: 750,
              color: "rgb(47, 109, 184)",
              fontSize: 15,
            }}
          >
            {translateLabel(languageTranslate, "BAC SI DOC KET QUA", false)}
          </h3>

          {renderDoctorInfo(readingDoctor, true)}
        </div>
      </div>
    </div>
  );
};

export default DoctorResultSection;
