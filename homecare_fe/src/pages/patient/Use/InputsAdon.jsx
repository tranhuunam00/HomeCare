import React from "react";
import { Row, Col, Input, Form } from "antd";
import ImageWithCaptionInput from "../../products/ImageWithCaptionInput/ImageWithCaptionInput";

/**
 * AddonInputSection
 * -----------------------------------------------------------------------------
 * A reusable React component wrapping the extra clinical input fields
 * (symptoms, progress, medical history, comparison link, old date) together with
 * the dynamic description/result/recommendation sections and an image list
 * uploader.
 *
 * Props
 * -----
 * - inputsAddon        : {Object}  current addon inputs (symptoms, progress, ...)
 * - setInputsAddon     : {Function} setter for addon inputs
 * - template           : {Object}  print template containing description/result/recommendation HTML
 * - inputsRender       : {Object}  state object holding dynamic field values
 * - setInputsRender    : {Function} setter for dynamic field values
 * - imageList          : {Array}   [{ url:string, caption:string }, ...]
 * - setImageList       : {Function} setter for image list
 * - renderDynamicAntdFields      : (htmlFields, state, setter) => ReactNode[]
 * - extractDynamicFieldsFromHtml : (html:string) => Array
 */

const AddonInputSection = ({
  inputsAddon,
  setInputsAddon,
  template,
  inputsRender,
  setInputsRender,
  imageList,
  setImageList,
  renderDynamicAntdFields,
  extractDynamicFieldsFromHtml,
}) => {
  /** ----------------------------------------------------------------------- */
  /** Handlers */
  /** ----------------------------------------------------------------------- */
  const handleAddonChange = (e) => {
    const { name, value } = e.target;
    setInputsAddon((prev) => ({ ...prev, [name]: value }));
  };

  /** ----------------------------------------------------------------------- */
  /** Render */
  /** ----------------------------------------------------------------------- */
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* BASIC ADDON INPUTS                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          width: "100%",
          fontSize: 11,
          padding: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          flexDirection: "row",
        }}
      >
        {/* Symptoms ------------------------------------------------------- */}
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            maxWidth: 600,
            flex: "1 1 100%",
          }}
        >
          <div style={{ marginBottom: 4 }}>Triệu chứng</div>
          <Input.TextArea
            size="small"
            rows={2}
            name="symptoms"
            value={inputsAddon.symptoms}
            onChange={handleAddonChange}
            style={{ fontSize: 11 }}
          />
        </div>

        {/* Progress ------------------------------------------------------- */}
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            maxWidth: 600,
            flex: "1 1 100%",
          }}
        >
          <div style={{ marginBottom: 4 }}>Diễn biến</div>
          <Input
            size="small"
            name="progress"
            value={inputsAddon.progress}
            onChange={handleAddonChange}
            style={{ fontSize: 11 }}
          />
        </div>

        {/* Medical history ------------------------------------------------ */}
        <div
          style={{
            marginBottom: 8,
            fontSize: 11,
            maxWidth: 600,
            flex: "1 1 100%",
          }}
        >
          <div style={{ marginBottom: 4 }}>Tiền sử bệnh</div>
          <Input
            size="small"
            name="medical_history"
            value={inputsAddon.medical_history}
            onChange={handleAddonChange}
            style={{ fontSize: 11 }}
          />
        </div>

        {/* Compare link + Old date --------------------------------------- */}
        <Row gutter={12} style={{ maxWidth: 600, flex: "1 1 100%" }}>
          <Col span={16}>
            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <div style={{ marginBottom: 4 }}>Link so sánh:</div>
              <Input
                size="small"
                name="compare_link"
                value={inputsAddon.compare_link}
                onChange={handleAddonChange}
                style={{ fontSize: 11 }}
              />
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <div style={{ marginBottom: 4 }}>Có kết quả cũ:</div>
              <Input
                size="small"
                name="old_date"
                value={inputsAddon.old_date}
                onChange={handleAddonChange}
                style={{ fontSize: 11 }}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DYNAMIC FIELDS INPUT GROUPS                                       */}
      {/* ------------------------------------------------------------------ */}
      <h2>Chỗ nhập liệu</h2>

      {/* Description & technique */}
      <h4>QUY TRÌNH KỸ THUẬT</h4>
      <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
        {renderDynamicAntdFields(
          extractDynamicFieldsFromHtml(template?.description || ""),
          inputsRender,
          setInputsRender
        )}
      </div>

      {/* Result */}
      <h4>MÔ TẢ HÌNH ẢNH</h4>
      <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
        {renderDynamicAntdFields(
          extractDynamicFieldsFromHtml(template?.result || ""),
          inputsRender,
          setInputsRender
        )}
      </div>

      {/* Recommendation */}
      <h4>KẾT LUẬN CHẨN ĐOÁN</h4>
      <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
        {renderDynamicAntdFields(
          extractDynamicFieldsFromHtml(template?.recommendation || ""),
          inputsRender,
          setInputsRender
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* IMAGE LIST INPUT                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Form.Item label="Hình ảnh minh họa">
        {/* ImageWithCaptionInput is expected to be provided by parent scope */}
        <ImageWithCaptionInput value={imageList} onChange={setImageList} />
      </Form.Item>
    </>
  );
};

export default AddonInputSection;
