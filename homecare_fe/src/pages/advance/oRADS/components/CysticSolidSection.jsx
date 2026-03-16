import React from "react";
import { Form, Typography, Radio, Row, Col } from "antd";
import ImageRadioCard from "./ImageRadioCard";
import {
  DARK_T2_DWI_OPTIONS,
  DCE_RISK_CURVE,
  LARGE_VOL_LIPID_OPTIONS,
  NON_DCE_ENH_AT_30S,
} from "../oradsConstants";

const { Paragraph } = Typography;

/**
 * Flow cho "Cystic lesion with a solid* component"
 * Props (state lift lên OradsForm):
 *  - solidDark: boolean|null
 *  - setSolidDark: (v)=>void
 *  - dceCurve: 'low'|'intermediate'|'high'|'not_available'|null
 *  - setDceCurve: (v)=>void
 *  - solidLipid: boolean|null              // large volume enhancing with lipid?
 *  - setSolidLipid: (v)=>void
 *  - nonDceEnh: 'lte_myometrium'|'gt_myometrium'|null
 *  - setNonDceEnh: (v)=>void
 */
export default function CysticSolidSection({
  solidDark,
  setSolidDark,
  dceCurve,
  setDceCurve,
  solidLipid,
  setSolidLipid,
  nonDceEnh,
  setNonDceEnh,
}) {
  return (
    <>
      {/* Q1: Dark T2 & Dark DWI */}
      <Form.Item
        label="Mô đặc có giảm tín hiệu đồng nhất trên T2 và DWI không (tức là T2 tối và DWI tối)?Is the solid tissue homogeneously hypointense on T2 and DWI (i.e. Dark T2 and Dark DWI)?"
        required
        colon={false}
        style={{ marginBottom: 12 }}
      >
        <Radio.Group
          value={solidDark}
          onChange={(e) => {
            setSolidDark(e.target.value);
            // reset các nhánh sau
            setDceCurve(null);
            setSolidLipid(null);
            setNonDceEnh(null);
          }}
        >
          <Row gutter={[12, 12]}>
            {DARK_T2_DWI_OPTIONS.map((o) => (
              <Col key={String(o.value)} span={24}>
                <Radio value={o.value}>{o.label}</Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Nếu Yes -> đủ điều kiện O-RADS 2, không hỏi tiếp */}
      {solidDark === false && (
        <>
          {/* Q2: DCE curve */}
          <Form.Item
            label="Đường cong tăng quang của tổn thương trên DCE-MRI như thế nào?"
            required
            colon={false}
            style={{ marginTop: 20, marginBottom: 8 }}
          >
            <Paragraph style={{ color: "#9aa3af", marginTop: 0 }}>
              Chọn dạng đường cong tín hiệu theo thời gian (time–intensity
              curve).
            </Paragraph>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(260px, 320px))",
                gap: 20,
              }}
            >
              {DCE_RISK_CURVE.map((o) => (
                <ImageRadioCard
                  key={o.value}
                  selected={dceCurve === o.value}
                  image={o.img}
                  label={o.label}
                  note={o.note}
                  onClick={() => {
                    setDceCurve(o.value);
                    // reset nhánh con
                    setSolidLipid(null);
                    setNonDceEnh(null);
                  }}
                />
              ))}
            </div>
          </Form.Item>

          {/* Nếu chọn Low risk → hỏi ảnh 2 (lipid, large volume?) */}
          {dceCurve === "low" && (
            <Form.Item
              label="Mô đặc có tăng quang với thể tích lớn và có chứa thành phần lipid (mỡ) không?"
              required
              colon={false}
              style={{ marginTop: 20, marginBottom: 0 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(260px, 320px))",
                  gap: 20,
                }}
              >
                {LARGE_VOL_LIPID_OPTIONS.map((o) => (
                  <ImageRadioCard
                    key={String(o.value)}
                    selected={solidLipid === o.value}
                    image={o.img}
                    label={o.label}
                    onClick={() => setSolidLipid(o.value)}
                  />
                ))}
              </div>
            </Form.Item>
          )}

          {/* Nếu DCE not available → hỏi ảnh 3 (non-DCE 30–40s) */}
          {dceCurve === "not_available" && (
            <Form.Item
              label="Mức độ tăng quang của tổn thương trên MRI (không theo chuỗi DCE) tại thời điểm 30–40 giây sau khi tiêm thuốc cản quang như thế nào?"
              required
              colon={false}
              style={{ marginTop: 20, marginBottom: 0 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(260px, 420px))",
                  gap: 20,
                }}
              >
                {NON_DCE_ENH_AT_30S.map((o) => (
                  <ImageRadioCard
                    key={o.value}
                    selected={nonDceEnh === o.value}
                    image={o.img}
                    label={o.label}
                    onClick={() => setNonDceEnh(o.value)}
                  />
                ))}
              </div>
            </Form.Item>
          )}
        </>
      )}
    </>
  );
}
