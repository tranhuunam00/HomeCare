import React from "react";
import { Form, Radio, Row, Col, InputNumber, Typography } from "antd";
import ImageRadioCard from "./ImageRadioCard";
import {
  US_LESION_TYPES,
  US_BENIGN_OVARIAN_OPTIONS,
  US_OTHER_COMPOSITION,
  US_OTHER_CHAMBERS,
  US_OTHER_CONTOUR,
  US_PAPILLARY_COUNT,
  US_YES_NO,
  US_COLOR_SCORE,
} from "../oradsConstants";

const { Paragraph } = Typography;

export default function UltrasoundSection({
  // chung
  usAdequate,
  setUsAdequate,
  usType,
  setUsType,

  // typical benign ovarian
  usBenignType,
  setUsBenignType,
  usMaxDiameter,
  setUsMaxDiameter,

  // other ovarian – shared
  usOtherComposition,
  setUsOtherComposition,
  usOtherChambers,
  setUsOtherChambers,
  usOtherContour,
  setUsOtherContour,
  usOtherEchoSept,
  setUsOtherEchoSept,
  usOtherMenopause,
  setUsOtherMenopause,
  usColorScore,
  setUsColorScore,

  // NEW for WITH solid & SOLID-appearing
  usPapillaryCount,
  setUsPapillaryCount,
  usShadowing,
  setUsShadowing,
}) {
  const size = Number(usMaxDiameter ?? NaN);
  const isSizeKnown = !Number.isNaN(size);

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
              setUsOtherComposition(null);
              setUsOtherChambers(null);
              setUsOtherContour(null);
              setUsOtherEchoSept(null);
              setUsOtherMenopause(null);
              setUsColorScore(null);
              setUsPapillaryCount(null);
              setUsShadowing(null);
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
        >
          <Radio.Group
            value={usType}
            onChange={(e) => {
              setUsType(e.target.value);
              // reset nhánh phụ
              setUsBenignType(null);
              setUsMaxDiameter(null);
              setUsOtherComposition(null);
              setUsOtherChambers(null);
              setUsOtherContour(null);
              setUsOtherEchoSept(null);
              setUsOtherMenopause(null);
              setUsColorScore(null);
              setUsPapillaryCount(null);
              setUsShadowing(null);
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

      {/* Q3A: Typical benign ovarian (cards + size) */}
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
              with reticular/retractile clot.
              <br />
              ** Dermoid cyst: ≤3 locules, no internal vascularity, hyperechoic
              component with shadowing/lines/dots/spherical structures.
              <br />§ Endometrioma: ≤3 locules, no internal vascularity,
              homogeneous low-level echoes, smooth walls/septation ± peripheral
              punctate echogenic foci.
            </Paragraph>
          </Form.Item>

          <Form.Item
            label="What is the maximum diameter of the lesion*? (cm)"
            required
            colon={false}
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

      {/* Q3B: Other ovarian lesions */}
      {usAdequate === true && usType === "other_ovarian" && (
        <>
          {/* Composition */}
          <Form.Item
            label="How is the lesion’s composition?"
            required
            colon={false}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(260px, 320px))",
                gap: 20,
              }}
            >
              {US_OTHER_COMPOSITION.map((o) => (
                <ImageRadioCard
                  key={o.value}
                  selected={usOtherComposition === o.value}
                  image={o.img}
                  label={o.label}
                  note={o.note}
                  onClick={() => {
                    setUsOtherComposition(o.value);
                    setUsMaxDiameter(null);
                    setUsOtherChambers(null);
                    setUsOtherContour(null);
                    setUsOtherEchoSept(null);
                    setUsOtherMenopause(null);
                    setUsColorScore(null);
                    setUsPapillaryCount(null);
                    setUsShadowing(null);
                  }}
                />
              ))}
            </div>
          </Form.Item>

          {/* Size (dùng chung) */}
          {usOtherComposition && (
            <Form.Item
              label="What is the maximum diameter of the lesion*? (cm)"
              required
              colon={false}
            >
              <InputNumber
                value={usMaxDiameter}
                onChange={setUsMaxDiameter}
                min={0}
                step={0.1}
                style={{ width: 240 }}
                placeholder="e.g. 7.2"
              />
              <Paragraph style={{ color: "#9aa3af", marginTop: 6 }}>
                * In any plane
              </Paragraph>
            </Form.Item>
          )}

          {/* ===== A) Cystic WITHOUT solid (giữ nguyên như trước) ===== */}
          {usOtherComposition === "cystic_no_solid" && isSizeKnown && (
            <>
              <Form.Item
                label="How many chambers does the cyst have?"
                required
                colon={false}
              >
                <Radio.Group
                  value={usOtherChambers}
                  onChange={(e) => {
                    setUsOtherChambers(e.target.value);
                    setUsOtherContour(null);
                    setUsOtherEchoSept(null);
                    setUsOtherMenopause(null);
                    setUsColorScore(null);
                  }}
                >
                  <Row gutter={[12, 8]}>
                    {US_OTHER_CHAMBERS.map((o) => (
                      <Col key={o.value} span={24}>
                        <Radio value={o.value}>{o.label}</Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              {!!usOtherChambers && (
                <Form.Item
                  label="How are the septations (if applicable) and internal contour of the lesion?"
                  required
                  colon={false}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(260px, 420px))",
                      gap: 20,
                    }}
                  >
                    {US_OTHER_CONTOUR.map((o) => (
                      <ImageRadioCard
                        key={o.value}
                        selected={usOtherContour === o.value}
                        image={o.img}
                        label={o.label}
                        onClick={() => {
                          setUsOtherContour(o.value);
                          setUsOtherEchoSept(null);
                          setUsOtherMenopause(null);
                          setUsColorScore(null);
                        }}
                      />
                    ))}
                  </div>
                </Form.Item>
              )}

              {/* unilocular + size<10 -> hỏi echoes/septations & menopause (nếu smooth) */}
              {size < 10 &&
                usOtherChambers === "uni" &&
                usOtherContour === "smooth" && (
                  <>
                    <Form.Item
                      label="Are there internal echoes (i.e., acoustic shadowing) and/or incomplete septations?"
                      required
                      colon={false}
                    >
                      <Radio.Group
                        value={usOtherEchoSept}
                        onChange={(e) => {
                          setUsOtherEchoSept(e.target.value);
                          setUsOtherMenopause(null);
                        }}
                      >
                        <Row gutter={[12, 8]}>
                          {[
                            {
                              value: "internal_echoes",
                              label: "Internal echoes",
                            },
                            {
                              value: "incomplete_septations",
                              label: "Incomplete septations",
                            },
                            {
                              value: "both",
                              label:
                                "Both internal echoes and incomplete septations",
                            },
                            { value: "neither", label: "Neither" },
                          ].map((o) => (
                            <Col key={o.value} span={24}>
                              <Radio value={o.value}>{o.label}</Radio>
                            </Col>
                          ))}
                        </Row>
                      </Radio.Group>
                    </Form.Item>

                    {usOtherEchoSept === "neither" && (
                      <Form.Item
                        label="Is the patient pre-menopausal or post-menopausal?"
                        required
                        colon={false}
                      >
                        <Radio.Group
                          value={usOtherMenopause}
                          onChange={(e) => setUsOtherMenopause(e.target.value)}
                        >
                          <Row gutter={[12, 8]}>
                            <Col span={24}>
                              <Radio value="pre">Pre-menopausal</Radio>
                            </Col>
                            <Col span={24}>
                              <Radio value="post">Post-menopausal</Radio>
                            </Col>
                          </Row>
                        </Radio.Group>
                      </Form.Item>
                    )}
                  </>
                )}

              {/* multilocular + smooth -> color score */}
              {usOtherChambers === "multi" && usOtherContour === "smooth" && (
                <Form.Item
                  label="What is the lesion's color score?"
                  required
                  colon={false}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(200px, 260px))",
                      gap: 16,
                    }}
                  >
                    {US_COLOR_SCORE.map((o) => (
                      <ImageRadioCard
                        key={o.value}
                        selected={usColorScore === o.value}
                        image={o.img}
                        label={o.label}
                        onClick={() => setUsColorScore(o.value)}
                      />
                    ))}
                  </div>
                </Form.Item>
              )}
            </>
          )}

          {/* ===== B) Cystic WITH solid component(s) ===== */}
          {usOtherComposition === "cystic_with_solid" && (
            <>
              <Form.Item
                label="How many chambers does the cyst have?"
                required
                colon={false}
              >
                <Radio.Group
                  value={usOtherChambers}
                  onChange={(e) => {
                    setUsOtherChambers(e.target.value);
                    setUsPapillaryCount(null);
                    setUsColorScore(null);
                  }}
                >
                  <Row gutter={[12, 8]}>
                    {US_OTHER_CHAMBERS.map((o) => (
                      <Col key={o.value} span={24}>
                        <Radio value={o.value}>{o.label}</Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>

              {usOtherChambers === "uni" && (
                <Form.Item
                  label="How many papillary projections* can you identify?"
                  required
                  colon={false}
                >
                  <Radio.Group
                    value={usPapillaryCount}
                    onChange={(e) => setUsPapillaryCount(e.target.value)}
                  >
                    <Row gutter={[12, 8]}>
                      {US_PAPILLARY_COUNT.map((o) => (
                        <Col key={o.value} span={24}>
                          <Radio value={o.value}>{o.label}</Radio>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                  <Paragraph style={{ color: "#9aa3af", marginTop: 6 }}>
                    * Subtype of solid component surrounded by fluid on 3 sides
                  </Paragraph>
                </Form.Item>
              )}

              {(usOtherChambers === "bi" || usOtherChambers === "multi") && (
                <Form.Item
                  label="What is the lesion’s color score?"
                  required
                  colon={false}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, minmax(200px, 260px))",
                      gap: 16,
                    }}
                  >
                    {US_COLOR_SCORE.map((o) => (
                      <ImageRadioCard
                        key={o.value}
                        selected={usColorScore === o.value}
                        image={o.img}
                        label={o.label}
                        onClick={() => setUsColorScore(o.value)}
                      />
                    ))}
                  </div>
                </Form.Item>
              )}
            </>
          )}

          {/* ===== C) Solid / Solid-appearing (≥80% solid) ===== */}
          {usOtherComposition === "solid_or_solid_appearing" && (
            <>
              <Form.Item
                label="How is the external contour of the lesion?"
                required
                colon={false}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(260px, 420px))",
                    gap: 20,
                  }}
                >
                  {US_OTHER_CONTOUR.map((o) => (
                    <ImageRadioCard
                      key={o.value}
                      selected={usOtherContour === o.value}
                      image={o.img}
                      label={o.label}
                      onClick={() => {
                        setUsOtherContour(o.value);
                        setUsShadowing(null);
                        setUsColorScore(null);
                      }}
                    />
                  ))}
                </div>
              </Form.Item>

              {usOtherContour === "smooth" && (
                <>
                  <Form.Item
                    label="Does the lesion show acoustic shadowing?"
                    required
                    colon={false}
                  >
                    <Radio.Group
                      value={usShadowing}
                      onChange={(e) => setUsShadowing(e.target.value)}
                    >
                      <Row gutter={[12, 8]}>
                        {US_YES_NO.map((o) => (
                          <Col key={String(o.value)} span={24}>
                            <Radio value={o.value}>{o.label}</Radio>
                          </Col>
                        ))}
                      </Row>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    label="What is the lesion’s color score?"
                    required
                    colon={false}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(200px, 260px))",
                        gap: 16,
                      }}
                    >
                      {US_COLOR_SCORE.map((o) => (
                        <ImageRadioCard
                          key={o.value}
                          selected={usColorScore === o.value}
                          image={o.img}
                          label={o.label}
                          onClick={() => setUsColorScore(o.value)}
                        />
                      ))}
                    </div>
                  </Form.Item>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
