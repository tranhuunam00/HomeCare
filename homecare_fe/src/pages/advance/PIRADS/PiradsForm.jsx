import React, { useEffect, useState } from "react";
import { Form, Radio, Typography, Divider, Button, Row, Col } from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./PiradsForm.module.scss";

import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";
import { STYLE_COPY } from "../../../constant/app";
import ImageSelectCard from "./components/ImageSelectCard";
import {
  DWI_ADC_OPTIONS,
  getPiradsScore,
  PIRADS_RESULT,
  T2w_OPTIONS,
  YES_NO_OPTIONS,
} from "./piradsConstants";

const { Text } = Typography;

export default function PiradsForm() {
  const [form] = Form.useForm();

  const dwiAdequate = Form.useWatch("dwiAdequate", form);
  const dceAdequate = Form.useWatch("dceAdequate", form);
  const zone = Form.useWatch("zone", form);
  const dwiScore = Form.useWatch("dwiScore", form);

  const [summary, setSummary] = useState({
    score: null,
    title: "",
    desc: "",
  });

  useEffect(() => {
    const values = form.getFieldsValue();

    if (!values.zone || !values.dwiScore) return;

    const score = getPiradsScore(values);

    const result = PIRADS_RESULT[score];

    if (result) {
      setSummary({
        score,
        title: result.title,
        desc: result.desc,
      });
    }
  }, [zone, dwiScore]);

  const [cannotCalculate, setCannotCalculate] = useState(false);

  const defaultValues = {};

  const onValuesChange = (_, values) => {
    const { dwiAdequate, dceAdequate } = values;

    if (dwiAdequate === false && dceAdequate === false) {
      setCannotCalculate(true);
    } else {
      setCannotCalculate(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setCannotCalculate(false);
  };

  const genHtml = async () => {
    const values = await form.validateFields();

    const html = `
      <table>
        <caption>Đánh giá PI-RADS</caption>
        <tr><th>Thông tin</th><th>Kết quả</th></tr>

        <tr>
          <td>DWI adequate</td>
          <td>${values.dwiAdequate ? "Yes" : "No"}</td>
        </tr>

        <tr>
          <td>DCE adequate</td>
          <td>${values.dceAdequate ? "Yes" : "No"}</td>
        </tr>

        <tr>
          <td>Khả năng tính PI-RADS</td>
          <td>
          ${
            values.dwiAdequate === false && values.dceAdequate === false
              ? "Không thể tính PI-RADS"
              : "Có thể tiếp tục đánh giá"
          }
          </td>
        </tr>
      </table>
    `;

    return html;
  };

  const onCopy = async () => {
    const html = `
      ${STYLE_COPY}
      ${await genHtml()}
    `;

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ]);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form
          form={form}
          layout="vertical"
          initialValues={defaultValues}
          onValuesChange={onValuesChange}
        >
          <ThamKhaoLinkHomeCare
            name={"D-PIRADS"}
            desc={
              "Đánh giá tổn thương tuyến tiền liệt theo hệ thống PI-RADS v2.1"
            }
          />

          <div style={{ marginBottom: 50 }}></div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="dwiAdequate"
                label="Is the DWI adequate?"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  {YES_NO_OPTIONS.map((opt) => (
                    <Radio key={opt.label} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dceAdequate"
                label="Is the DCE adequate?"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  {YES_NO_OPTIONS.map((opt) => (
                    <Radio key={opt.label} value={opt.value}>
                      {opt.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {dwiAdequate === true && dceAdequate === false && (
            <Form.Item
              name="zone"
              label="Where is the lesion located?"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="pz">Peripheral zone</Radio>
                <Radio value="tz">Transitional zone</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {zone === "pz" && (
            <>
              <Form.Item
                name="dwiScore"
                label="How does the lesion look on DWI and ADC?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={DWI_ADC_OPTIONS}
                  value={form.getFieldValue("dwiScore")}
                  onChange={(v) => form.setFieldsValue({ dwiScore: v })}
                />
              </Form.Item>

              <Form.Item
                name="t2Score"
                label="How does the lesion look on T2w imaging?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={T2w_OPTIONS}
                  value={form.getFieldValue("t2Score")}
                  onChange={(v) => form.setFieldsValue({ t2Score: v })}
                />
              </Form.Item>
            </>
          )}

          {cannotCalculate && (
            <div className={styles.warningBox}>
              <Text strong>Cannot calculate the PI-RADS score:</Text>
              <br />

              <Text type="secondary">
                If both DWI and DCE are inadequate or absent, assessment should
                be limited to staging for determination of extraprostatic
                extension.
              </Text>
            </div>
          )}

          {summary.score && (
            <Row className={styles.summaryRow}>
              <Col span={24}>
                <Text strong>Calculated Score:</Text>{" "}
                <Text type="danger">{summary.title}</Text>
              </Col>

              <Col span={24}>
                <Text>{summary.desc}</Text>
              </Col>
            </Row>
          )}

          <Divider />

          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>

            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
