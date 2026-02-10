import React from "react";
import { Row, Col, Form, Radio, Tooltip } from "antd";
import {
  ADDITIONAL_ACTION_OPTIONS,
  CONTRAST_INJECTION_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
} from "../formver3.constant";
import { translateLabel } from "../../../constant/app";

const AdvancedSampleSection = ({
  isEdit = true,
  isAdvanceSample = true,
  languageTranslate,
}) => {
  console.log("languageTranslate", languageTranslate);
  return (
    <Row>
      {/* Mẫu nâng cao */}

      <Col xs={24}>
        {/* Tiêm thuốc đối quang */}
        <Form.Item
          label={translateLabel(
            languageTranslate,
            "Tiêm thuốc đối quang",
            false,
          )}
          name="contrastInjection"
          rules={[{ required: true, message: "Chọn thông tin tiêm thuốc" }]}
        >
          <Radio.Group disabled={!isEdit}>
            {CONTRAST_INJECTION_OPTIONS.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {translateLabel(languageTranslate, opt.label, false)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* Chất lượng hình ảnh */}
        <Form.Item
          label={translateLabel(
            languageTranslate,
            "Chất lượng hình ảnh",
            false,
          )}
          name="imageQuatity"
          rules={[
            {
              required: true,
              message: "Đánh giá chất lượng hình ảnh",
            },
          ]}
        >
          <Radio.Group disabled={!isEdit}>
            {IMAGE_QUALITY_OPTIONS.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {translateLabel(languageTranslate, opt.label, false)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* Thực hiện bổ sung */}

        <Form.Item
          label={translateLabel(languageTranslate, "Thực hiện bổ sung", false)}
          name="additionalAction"
          rules={[
            {
              required: true,
              message: "Chọn thực hiện bổ sung",
            },
          ]}
        >
          <Radio.Group disabled={!isEdit}>
            {ADDITIONAL_ACTION_OPTIONS.map((opt) => (
              <Radio key={opt.value} value={opt.value}>
                {translateLabel(languageTranslate, opt.label, false)}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Col>
    </Row>
  );
};

export default AdvancedSampleSection;
