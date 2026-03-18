import React, { useEffect, useState } from "react";
import { Form, Radio, Typography, Divider, Button, Row, Col } from "antd";
import { ReloadOutlined, CopyOutlined } from "@ant-design/icons";

import styles from "./PiradsForm.module.scss";

import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";
import { STYLE_COPY } from "../../../constant/app";
import ImageSelectCard from "./components/ImageSelectCard";
import {
  DCE_OPTIONS,
  DWI_ADC_OPTIONS,
  getPiradsScore,
  PIRADS_RESULT,
  T2w_OPTIONS_WITH_PZ,
  T2w_OPTIONS_WITH_TZ,
  YES_NO_OPTIONS,
} from "./piradsConstants";

const { Text } = Typography;

export default function PiradsForm() {
  const [form] = Form.useForm();

  const dwiAdequate = Form.useWatch("dwiAdequate", form);
  const dceAdequate = Form.useWatch("dceAdequate", form);
  const zone = Form.useWatch("zone", form);
  const dwiScore = Form.useWatch("dwiScore", form);
  const t2Score_tz = Form.useWatch("t2Score_tz", form);
  const t2Score_pz = Form.useWatch("t2Score_pz", form);
  const dceScore = Form.useWatch("dceScore", form);

  const [summary, setSummary] = useState({
    score: null,
    title: "",
    desc: "",
  });

  useEffect(() => {
    const values = form.getFieldsValue();

    if (!values.zone) return;
    console.log("values", values);

    const score = getPiradsScore(values);

    const result = PIRADS_RESULT[score];

    if (result) {
      setSummary({
        score,
        title: result.title,
        desc: result.desc,
      });
    }
  }, [
    zone,
    dwiScore,
    t2Score_tz,
    t2Score_pz,
    dwiAdequate,
    dceScore,
    dceAdequate,
  ]);

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

    const score = getPiradsScore(values);
    const result = PIRADS_RESULT[score];

    const getLabel = (options, value) => {
      return options.find((o) => o.value === value)?.label || "";
    };

    const getYesNo = (value) => (value ? "Có" : "Không");

    const zoneText =
      values.zone === "pz"
        ? "Vùng ngoại vi (Peripheral zone)"
        : values.zone === "tz"
          ? "Vùng chuyển tiếp (Transitional zone)"
          : "";

    const html = `
  <div style="font-family: Times New Roman; font-size: 14px; line-height: 1.6">
    
    <h3 style="text-align:center; margin-bottom:10px">
      BÁO CÁO ĐÁNH GIÁ PI-RADS (MRI TUYẾN TIỀN LIỆT)
    </h3>

    <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse">
      <tr>
        <th style="width:40%">Thông tin</th>
        <th>Kết quả</th>
      </tr>

      <tr>
        <td>DWI đạt yêu cầu</td>
        <td>${getYesNo(values.dwiAdequate)}</td>
      </tr>

      <tr>
        <td>DCE đạt yêu cầu</td>
        <td>${getYesNo(values.dceAdequate)}</td>
      </tr>

      <tr>
        <td>Vị trí tổn thương</td>
        <td>${zoneText}</td>
      </tr>

      ${
        values.dwiScore
          ? `
      <tr>
        <td>DWI / ADC</td>
        <td>${getLabel(DWI_ADC_OPTIONS, values.dwiScore)}</td>
      </tr>`
          : ""
      }

      ${
        values.t2Score_pz
          ? `
      <tr>
        <td>T2W (vùng ngoại vi)</td>
        <td>${getLabel(T2w_OPTIONS_WITH_PZ, values.t2Score_pz)}</td>
      </tr>`
          : ""
      }

      ${
        values.t2Score_tz
          ? `
      <tr>
        <td>T2W (vùng chuyển tiếp)</td>
        <td>${getLabel(T2w_OPTIONS_WITH_TZ, values.t2Score_tz)}</td>
      </tr>`
          : ""
      }

      ${
        values.dceScore
          ? `
      <tr>
        <td>DCE</td>
        <td>${getLabel(DCE_OPTIONS, values.dceScore)}</td>
      </tr>`
          : ""
      }
    </table>

    <br/>

    <div>
      <b>KẾT LUẬN:</b><br/>
      ${
        result
          ? `
        <span style="color:red; font-weight:bold">${result.title}</span><br/>
        ${result.desc}<br/><br/>
        <b>Nguy cơ:</b> ${result.risk || ""}<br/>
        <b>Khuyến nghị:</b> ${result.recommendation || ""}
      `
          : "Không đủ dữ liệu để tính PI-RADS"
      }
    </div>

  </div>
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
                label="Chuỗi DWI có đạt chất lượng/đủ tiêu chuẩn không?"
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
                label="Chuỗi DCE có đạt chất lượng/đủ tiêu chuẩn không?"
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

          {(dwiAdequate === true || dceAdequate === true) && (
            <Form.Item
              name="zone"
              label="Tổn thương nằm ở đâu?"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="pz">Vùng ngoại vi</Radio>
                <Radio value="tz">Vùng chuyển tiếp</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {dwiAdequate === true && zone === "pz" && (
            <>
              {dwiAdequate === true && dceAdequate === true && (
                <Form.Item
                  name="dceScore"
                  label="Tổn thương biểu hiện như thế nào trên DCE?"
                  rules={[{ required: true }]}
                >
                  <ImageSelectCard
                    options={DCE_OPTIONS}
                    value={form.getFieldValue("dceScore")}
                    onChange={(v) => form.setFieldsValue({ dceScore: v })}
                  />
                </Form.Item>
              )}
              <Form.Item
                name="dwiScore"
                label="Tổn thương biểu hiện như thế nào trên DWI và ADC?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={DWI_ADC_OPTIONS}
                  value={form.getFieldValue("dwiScore")}
                  onChange={(v) => form.setFieldsValue({ dwiScore: v })}
                />
              </Form.Item>

              <Form.Item
                name="t2Score_pz"
                label="Tổn thương biểu hiện như thế nào trên ảnh T2W?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={T2w_OPTIONS_WITH_PZ}
                  value={form.getFieldValue("t2Score_pz")}
                  onChange={(v) => form.setFieldsValue({ t2Score_pz: v })}
                />
              </Form.Item>
            </>
          )}

          {dwiAdequate === true && zone === "tz" && (
            <>
              {dwiAdequate === true && dceAdequate === true && (
                <Form.Item
                  name="dceScore"
                  label="Tổn thương biểu hiện như thế nào trên DCE? *"
                  rules={[{ required: true }]}
                >
                  <ImageSelectCard
                    options={DCE_OPTIONS}
                    value={form.getFieldValue("dceScore")}
                    onChange={(v) => form.setFieldsValue({ dceScore: v })}
                  />
                </Form.Item>
              )}
              <Form.Item
                name="dwiScore"
                label="Tổn thương biểu hiện như thế nào trên DWI và ADC?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={DWI_ADC_OPTIONS}
                  value={form.getFieldValue("dwiScore")}
                  onChange={(v) => form.setFieldsValue({ dwiScore: v })}
                />
              </Form.Item>

              <Form.Item
                name="t2Score_tz"
                label="Tổn thương biểu hiện như thế nào trên ảnh T2W?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={T2w_OPTIONS_WITH_TZ}
                  value={form.getFieldValue("t2Score_tz")}
                  onChange={(v) => form.setFieldsValue({ t2Score_tz: v })}
                />
              </Form.Item>
            </>
          )}

          {dwiAdequate === false && zone === "pz" && (
            <>
              <Form.Item
                name="dceScore"
                label="Tổn thương biểu hiện như thế nào trên DCE? *"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={DCE_OPTIONS}
                  value={form.getFieldValue("dceScore")}
                  onChange={(v) => form.setFieldsValue({ dceScore: v })}
                />
              </Form.Item>

              <Form.Item
                name="t2Score_pz"
                label="Tổn thương biểu hiện như thế nào trên ảnh T2W?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={T2w_OPTIONS_WITH_PZ}
                  value={form.getFieldValue("t2Score_pz")}
                  onChange={(v) => form.setFieldsValue({ t2Score_pz: v })}
                />
              </Form.Item>
            </>
          )}

          {dwiAdequate === false && zone === "tz" && (
            <>
              <Form.Item
                name="dceScore"
                label="Tổn thương biểu hiện như thế nào trên DCE?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={DCE_OPTIONS}
                  value={form.getFieldValue("dceScore")}
                  onChange={(v) => form.setFieldsValue({ dceScore: v })}
                />
              </Form.Item>

              <Form.Item
                name="t2Score_tz"
                label="Tổn thương biểu hiện như thế nào trên ảnh T2W?"
                rules={[{ required: true }]}
              >
                <ImageSelectCard
                  options={T2w_OPTIONS_WITH_TZ}
                  value={form.getFieldValue("t2Score_tz")}
                  onChange={(v) => form.setFieldsValue({ t2Score_tz: v })}
                />
              </Form.Item>
            </>
          )}

          {cannotCalculate && (
            <div className={styles.warningBox}>
              <Text strong>Không thể tính/đánh giá điểm PI-RADS:</Text>
              <br />

              <Text type="secondary">
                Nếu cả DWI và DCE đều không đạt chất lượng hoặc không có, thì
                việc đánh giá nên chỉ giới hạn ở giai đoạn bệnh để xác định sự
                lan ra ngoài tuyến tiền liệt (xâm lấn ngoài bao).
              </Text>
            </div>
          )}

          {summary.score && (
            <Row className={styles.summaryRow}>
              <Col span={24}>
                <Text strong>Kết quả:</Text>{" "}
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
