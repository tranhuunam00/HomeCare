import React from "react";
import { Form, Radio, Row, Col, Typography } from "antd";
import ImageRadioCard from "./ImageRadioCard";
import { CYST_STRUCTURE, CYST_CONTENTS } from "../oradsConstants";

const { Title, Paragraph } = Typography;

/**
 * CysticLesionSection
 * - Hiển thị toàn bộ nhánh "Cystic lesion" của O-RADS (MRI – cystic)
 * - Toàn bộ state được "lift" lên OradsForm; component này chỉ render + phát sự kiện
 *
 * Props:
 *  - cystStruct: string | null
 *  - setCystStruct: (v) => void
 *  - cystContent: string | null
 *  - setCystContent: (v) => void
 *  - cystSmallPrem: boolean | null    // ≤3cm & tiền mãn kinh?
 *  - setCystSmallPrem: (v) => void
 *  - multilocHasFat: boolean | null   // lesion contain fat? (for multilocular)
 *  - setMultilocHasFat: (v) => void
 */
export default function CysticLesionSection({
  cystStruct,
  setCystStruct,
  cystContent,
  setCystContent,
  cystSmallPrem,
  setCystSmallPrem,
  multilocHasFat,
  setMultilocHasFat,
}) {
  return (
    <>
      {/* Structure - RADIO thường */}
      <Form.Item
        name="cyst_structure"
        label="How is the cyst's structure?"
        rules={[{ required: true, message: "Please choose one." }]}
      >
        <Radio.Group
          value={cystStruct}
          onChange={(e) => {
            setCystStruct(e.target.value);
            // reset các lựa chọn con khi đổi cấu trúc
            setCystContent(null);
            setCystSmallPrem(null);
            setMultilocHasFat(null);
          }}
        >
          <Row gutter={[12, 12]}>
            {CYST_STRUCTURE.map((opt) => (
              <Col key={opt.value} span={24}>
                <Radio value={opt.value}>{opt.label}</Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Contents - CARD (chỉ cho 2 loại unilocular) */}
      {(cystStruct === "uni_no_enh" || cystStruct === "uni_smooth_enh") && (
        <>
          <Title level={4} style={{ color: "#fff", margin: "8px 0 12px" }}>
            What are the contents of the cyst? *
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(240px, 320px))",
              gap: 20,
            }}
          >
            {CYST_CONTENTS.map((o) => (
              <ImageRadioCard
                key={o.value}
                selected={cystContent === o.value}
                image={o.img}
                label={o.label}
                onClick={() => {
                  setCystContent(o.value);
                  if (!["simple", "hemorrhagic"].includes(o.value)) {
                    setCystSmallPrem(null);
                  }
                }}
              />
            ))}
          </div>

          {/* Câu phụ (radio thường) */}
          {cystStruct === "uni_no_enh" &&
            ["simple", "hemorrhagic"].includes(cystContent || "") && (
              <>
                <Title
                  level={5}
                  style={{ color: "#fff", margin: "18px 0 8px" }}
                >
                  Is this a cyst ≤ 3 cm in a premenopausal patient? *
                </Title>
                <Radio.Group
                  value={cystSmallPrem}
                  onChange={(e) => setCystSmallPrem(e.target.value)}
                >
                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      <Radio value={true}>Yes</Radio>
                    </Col>
                    <Col span={24}>
                      <Radio value={false}>
                        No (cyst is &gt;3cm and/or patient is post-menopausal)
                      </Radio>
                    </Col>
                  </Row>
                </Radio.Group>
              </>
            )}
        </>
      )}

      {/* Multilocular (radio thường) */}
      {cystStruct === "multilocular" && (
        <>
          <Title level={4} style={{ color: "#fff", margin: "8px 0 8px" }}>
            Does the lesion contain fat? *
          </Title>
          <Paragraph style={{ color: "#9aa3af", marginTop: 0 }}>
            Fat is hyperintense on T2WI and hyperintense on T1WI, and loses
            signal on fat‑saturated images.
          </Paragraph>
          <Radio.Group
            value={multilocHasFat}
            onChange={(e) => setMultilocHasFat(e.target.value)}
          >
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Radio value={true}>Yes</Radio>
              </Col>
              <Col span={24}>
                <Radio value={false}>No</Radio>
              </Col>
            </Row>
          </Radio.Group>
        </>
      )}
    </>
  );
}
