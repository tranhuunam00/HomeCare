import React from "react";
import { Form, Radio, Row, Col, Typography } from "antd";
import ImageRadioCard from "./ImageRadioCard";
import { DILATED_TUBE_WALLS, DILATED_TUBE_CONTENTS } from "../oradsConstants";

const { Paragraph } = Typography;

/**
 * DilatedTubeSection
 * Flow:
 *  Q1: Walls/folds thickness -> thin|thick
 *  If thin -> Q2: tube contents (Simple fluid | Non-simple fluid)
 */
export default function DilatedTubeSection({
  tubeWall,
  setTubeWall,
  tubeContents,
  setTubeContents,
}) {
  return (
    <>
      {/* Q1: walls/endosalpingeal folds thickness */}
      <Form.Item
        label="How are the walls (or endosalpingeal folds*) of the fallopian tube?"
        required
        colon={false}
        style={{ marginBottom: 12 }}
      >
        <Paragraph style={{ color: "#9aa3af", marginTop: 0 }}>
          * are incomplete septations or short round projections, orthogonal to
          the length of the tube
        </Paragraph>
        <Radio.Group
          value={tubeWall}
          onChange={(e) => {
            setTubeWall(e.target.value);
            // nếu chọn thick thì không cần hỏi contents
            if (e.target.value === "thick") setTubeContents(null);
          }}
        >
          <Row gutter={[12, 12]}>
            {DILATED_TUBE_WALLS.map((o) => (
              <Col key={o.value} span={24}>
                <Radio value={o.value}>{o.label}</Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Q2: contents (chỉ hiển thị khi thin) */}
      {tubeWall === "thin" && (
        <Form.Item
          label="What are the contents of the fallopian tube?"
          required
          colon={false}
          style={{ marginTop: 16, marginBottom: 0 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(260px, 520px))",
              gap: 20,
            }}
          >
            {DILATED_TUBE_CONTENTS.map((o) => (
              <ImageRadioCard
                key={o.value}
                selected={tubeContents === o.value}
                image={o.img}
                label={o.label}
                note={o.note}
                onClick={() => setTubeContents(o.value)}
              />
            ))}
          </div>
        </Form.Item>
      )}
    </>
  );
}
