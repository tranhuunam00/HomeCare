import React from "react";
import { Form, Radio, Row, Col, InputNumber, Typography } from "antd";
import ImageRadioCard from "./ImageRadioCard";
import { US_LESION_TYPES, US_BENIGN_OVARIAN_OPTIONS } from "../oradsConstants";

const { Paragraph } = Typography;

export default function UltrasoundSection({
  usAdequate,
  setUsAdequate,
  usType,
  setUsType,
  usBenignType,
  setUsBenignType,
  usMaxDiameter,
  setUsMaxDiameter,
}) {
  return (
    <>
      {/* Q1: Adequacy */}
      <Form.Item
        label="O-RADS: US — Is this a technically adequate exam?"
        required
        colon={false}
        style={{ marginBottom: 12 }}
      >
        <Radio.Group
          value={usAdequate}
          onChange={(e) => {
            setUsAdequate(e.target.value);
            if (e.target.value !== true) {
              setUsType(null);
              setUsBenignType(null);
              setUsMaxDiameter(null);
            }
          }}
        >
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Radio value={true}>Yes</Radio>
            </Col>
            <Col span={24}>
              <Radio value={false}>
                No, lesion features relevant for risk stratification cannot be
                accurately characterized due to technical factors
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Q2: Type (Radio thường) */}
      {usAdequate === true && (
        <Form.Item
          label="What type of lesion have you identified?"
          required
          colon={false}
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          <Radio.Group
            value={usType}
            onChange={(e) => {
              setUsType(e.target.value);
              setUsBenignType(null);
              setUsMaxDiameter(null);
            }}
          >
            <Row gutter={[12, 8]}>
              {US_LESION_TYPES.map((o) => (
                <Col key={o.value} span={24}>
                  <Radio value={o.value}>{o.label}</Radio>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
      )}

      {/* Q3: Typical benign ovarian → subtype + size (giữ dạng card + input) */}
      {usAdequate === true && usType === "typical_benign_ovarian" && (
        <>
          <Form.Item
            label="Which option best describes the benign ovarian lesion?"
            required
            colon={false}
            style={{ marginTop: 12, marginBottom: 8 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(260px, 320px))",
                gap: 20,
              }}
            >
              {US_BENIGN_OVARIAN_OPTIONS.map((o) => (
                <ImageRadioCard
                  key={o.value}
                  selected={usBenignType === o.value}
                  image={o.img}
                  label={o.label}
                  onClick={() => setUsBenignType(o.value)}
                />
              ))}
            </div>
            <Paragraph style={{ color: "#9aa3af", marginTop: 12 }}>
              * Hemorrhagic cyst: Unilocular cyst without internal vascularity
              with reticular or retractile clot. <br />
              ** Dermoid cyst: ≤3 locules, no internal vascularity, hyperechoic
              component with shadowing/lines/dots/spherical structures. <br />§
              Endometrioma: ≤3 locules, no internal vascularity, homogeneous
              low-level echoes, smooth walls/septation ± peripheral punctate
              echogenic foci.
            </Paragraph>
          </Form.Item>

          <Form.Item
            label="What is the maximum diameter of the lesion*? (cm)"
            required
            colon={false}
            style={{ marginTop: 12, marginBottom: 0 }}
          >
            <InputNumber
              value={usMaxDiameter}
              onChange={setUsMaxDiameter}
              min={0}
              step={0.1}
              style={{ width: 240 }}
              placeholder="e.g. 4.5"
            />
            <Paragraph style={{ color: "#9aa3af", marginTop: 6 }}>
              * In any plane
            </Paragraph>
          </Form.Item>
        </>
      )}
    </>
  );
}
