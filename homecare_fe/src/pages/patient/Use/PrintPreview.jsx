import React from "react";
import { Card } from "antd";
import dayjs from "dayjs";
import {
  ADMIN_INFO_LABELS,
  ADMIN_INFO_LABELS_EN,
  LANGUAGES,
} from "../../../constant/app";

const PrintPreview = ({
  printRef,
  printTemplate,
  patientDiagnose,
  inputsAddon,
  combinedHtml,
  imageList,
  doctor,
  provinces,
  districts,
  wards,
  calculateAge,
  lang = LANGUAGES.vi,
  serviceName,
}) => {
  const LABELS_ADDON =
    lang == LANGUAGES.vi ? ADMIN_INFO_LABELS : ADMIN_INFO_LABELS_EN;
  return (
    <div ref={printRef}>
      <Card bordered={false} className={`a4-page`}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            alignItems: "flex-start",
            gap: 20,
          }}
        >
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
            alt="Logo"
            width={100}
            height={100}
          />
          <div style={{ maxWidth: "350px" }}>
            <p style={{ fontWeight: 600, color: "red", fontSize: 16 }}>
              {printTemplate?.clinic_name || "[Tên phòng khám]"}
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Khoa:</strong> {printTemplate?.department_name || "-"}
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Địa chỉ:</strong> {printTemplate?.address || "-"}
            </p>
          </div>
          <div style={{ maxWidth: "280px" }}>
            <p style={{ fontSize: 14 }}>
              <strong>Website:</strong>{" "}
              <i>{printTemplate?.website || "http://..."}</i>
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Hotline:</strong> {printTemplate?.phone || "..."}
            </p>
            <p style={{ fontSize: 14 }}>
              <strong>Email:</strong>
              <i>{printTemplate?.email || "example@email.com"}</i>
            </p>
          </div>
        </header>
        <h2
          style={{
            textAlign: "center",
            fontSize: "30px",
            color: "##4299d4",
            fontWeight: 700,
          }}
        >
          {LABELS_ADDON.Medical_test_result}
        </h2>
        <h2
          style={{
            fontWeight: 500,
            textAlign: "center",
            fontSize: "20px",
            color: "#4299d4",
          }}
        >
          {serviceName}
        </h2>

        <div>
          <h3> {LABELS_ADDON.section_title}</h3>
          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.full_name}:
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
                  {LABELS_ADDON.gender}:
                </p>
              </div>
              <p style={{ margin: 0, padding: 0 }}>{patientDiagnose?.gender}</p>
            </div>
          </div>

          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.dob}:
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
                  {LABELS_ADDON.age}:
                </p>
              </div>
              <p style={{ margin: 0, padding: 0 }}>
                {calculateAge(patientDiagnose?.dob)}
              </p>
            </div>
          </div>

          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.country}:
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
                  {LABELS_ADDON.province}:
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
                {LABELS_ADDON.district}:
              </p>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {districts.find((s) => s.code == patientDiagnose?.district_code)
                  ?.name || "-"}
              </p>
            </div>
          </div>
          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.ward}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {wards.find((s) => s.code == patientDiagnose?.ward_code)
                  ?.name || "-"}
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
                  {LABELS_ADDON.address}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {patientDiagnose?.address || "-"}
              </p>
            </div>
          </div>
          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.phoneNumber}:
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
                  {LABELS_ADDON.email}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {patientDiagnose?.email || "-"}
              </p>
            </div>
          </div>

          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.symptoms}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {inputsAddon?.symptoms}
              </p>
            </div>
          </div>
          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.progress}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {inputsAddon?.progress}
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
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                    padding: 0,
                    marginRight: 10,
                  }}
                >
                  {LABELS_ADDON.medical_history}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {inputsAddon?.medical_history}
              </p>
            </div>
          </div>

          <div
            style={{
              marginBottom: 10,
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
                  {LABELS_ADDON.compare_link}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {inputsAddon?.compare_link}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
              }}
            >
              <div style={{ width: 120 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {LABELS_ADDON.old_date}:
                </p>
              </div>
              <p style={{ fontSize: 14, margin: 0, padding: 0 }}>
                {inputsAddon?.old_date}
              </p>
            </div>
          </div>
        </div>

        <div
          className="print-content"
          dangerouslySetInnerHTML={{ __html: combinedHtml }}
        />
        <h3>{LABELS_ADDON.image_section}</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
          }}
        >
          {imageList.map((item, idx) => (
            <section key={idx}>
              <img src={item.url} alt={`img-${idx}`} width={150} height={150} />
              <p style={{ width: 150 }}>{item.caption}</p>
            </section>
          ))}
        </div>
        <h3>{LABELS_ADDON.doctor}</h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <section>
            <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
              <div style={{ width: 150 }}>
                <strong>{LABELS_ADDON.full_name}:</strong>
              </div>
              {doctor.full_name}
            </div>
            <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
              <div style={{ width: 150 }}>
                <strong>{LABELS_ADDON.phoneNumber}:</strong>
              </div>
              {doctor.phone_number}
            </div>
            <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
              <div style={{ width: 150 }}>
                <strong>{LABELS_ADDON.time}:</strong>
              </div>
              {dayjs().format("DD-MM-YYYY HH:mm")}
            </div>
            <div style={{ display: "flex", marginBottom: 10, fontSize: 14 }}>
              <div style={{ width: 150 }}>
                <strong>{LABELS_ADDON.digital_signature}:</strong>
              </div>
              digital signed by Tran Van A
            </div>
          </section>
          <section>
            <img src={doctor?.avatar_url} alt="" width={100} height={100} />
          </section>
          <section>
            <img src={doctor?.signature_url} alt="" width={100} height={100} />
          </section>
        </div>
      </Card>
    </div>
  );
};

export default PrintPreview;
