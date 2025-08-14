// USSurveillanceForm.jsx — Standalone Ultrasound (Surveillance)
// AntD + toast + module SCSS. Tự quản lý toàn bộ state/logic US LI-RADS.

import React, { useState } from "react";
import { Form, Button, Radio, Row, Col, Divider, Typography } from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./LIRADSForm.module.scss";
import { toast } from "react-toastify";

const { Text, Title } = Typography;

/* ====================== HẰNG SỐ ====================== */
const US_HIGH_RISK_OPTIONS = [
  { label: "Có (Yes)", value: "yes" },
  { label: "Không (No)", value: "no" },
];

const US_FINDINGS_OPTIONS = [
  { label: "Không phát hiện (No findings)", value: "no_findings" },
  {
    label: "Có observation(s) (Vùng khác biệt so với nhu mô gan xung quanh)",
    value: "observations",
  },
  {
    label: "Huyết khối mới tĩnh mạch cửa hoặc tĩnh mạch gan",
    value: "new_thrombus",
  },
];

const US_OBS_KIND_OPTIONS = [
  {
    label: "Chỉ tổn thương chắc chắn lành tính (*)",
    value: "only_definitely_benign",
  },
  {
    label: "Tổn thương < 10 mm, không chắc chắn lành tính",
    value: "lt10_not_def_benign",
  },
  {
    label: "Tổn thương ≥ 10 mm, không chắc chắn lành tính",
    value: "ge10_not_def_benign",
  },
  {
    label:
      "Vùng biến dạng nhu mô ≥ 10 mm (dị đồng mơ hồ, bóng khúc xạ, mất cấu trúc)",
    value: "parenchymal_distortion_ge10",
  },
];

const US_AFP_OPTIONS = [
  { label: "AFP ≥ 20 ng/mL", value: "ge20" },
  {
    label: "AFP < 20 ng/mL nhưng tăng gấp đôi so với lần trước",
    value: "lt20_doubled",
  },
  {
    label: "AFP < 20 ng/mL nhưng tăng dần so với 2 lần đo liên tiếp gần nhất",
    value: "lt20_gradual",
  },
  {
    label: "AFP < 20 ng/mL, không xu hướng tăng dần",
    value: "lt20_no_increase",
  },
  { label: "Không rõ/không có (Unknown)", value: "unknown" },
];

const US_VIS_OPTIONS = [
  { label: "VIS-A*: Không hoặc tối thiểu hạn chế", value: "A" },
  { label: "VIS-B**: Hạn chế mức vừa", value: "B" },
  { label: "VIS-C***: Hạn chế nặng", value: "C" },
];

/* ====================== TIỆN ÍCH ====================== */
const getLabel = (arr, v) => arr.find((x) => x.value === v)?.label || v || "--";

/* ====================== LOGIC LI-RADS — US Surveillance ====================== */
const computeUSSurveillance = (highRisk, findings, obsKind, afp, vis) => {
  if (!highRisk) return { lr: "", rec: "" };

  if (highRisk === "no") {
    return {
      lr: "LI-RADS không áp dụng",
      rec: "LI-RADS chỉ áp dụng cho nhóm nguy cơ cao HCC. Không dùng cho người bệnh không nguy cơ cao.",
    };
  }

  // highRisk === "yes"
  if (!findings) return { lr: "", rec: "" };

  if (findings === "no_findings") {
    if (!afp) return { lr: "", rec: "" };

    if (afp === "ge20" || afp === "lt20_doubled" || afp === "lt20_gradual") {
      return {
        lr: "US-1 with positive AFP",
        rec: "Nếu AFP dương tính nhưng US không phải US-3, CEUS ít giúp ích. Tiếp tục thăm dò bằng MRI/CT chẩn đoán.",
      };
    }

    // lt20_no_increase / unknown
    if (!vis) return { lr: "", rec: "" };
    if (vis === "A" || vis === "B") {
      return {
        lr: "US-1 (Âm tính)",
        rec: "Không có bằng chứng HCC trên US. Lặp lại US sau 6 tháng.",
      };
    }
    return {
      lr: "US-1 (Âm tính) với VIS-C",
      rec: "Hạn chế nặng do điểm VIS thấp. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US trong 3 tháng; nếu vẫn VIS-C, xem xét chiến lược thay thế.",
    };
  }

  if (findings === "new_thrombus") {
    return {
      lr: "US-3 (Dương tính)",
      rec: "Có phát hiện cần làm rõ bằng chẩn đoán hình ảnh đa thì có cản quang (CT, MRI hoặc CEUS).",
    };
  }

  if (findings === "observations") {
    if (!obsKind) return { lr: "", rec: "" };

    if (
      obsKind === "parenchymal_distortion_ge10" ||
      obsKind === "ge10_not_def_benign"
    ) {
      return {
        lr: "US-3 (Dương tính)",
        rec: "Cần đặc trưng thêm với hình ảnh đa thì có cản quang (CT, MRI hoặc CEUS).",
      };
    }

    if (obsKind === "only_definitely_benign") {
      if (!afp) return { lr: "", rec: "" };
      if (afp === "ge20" || afp === "lt20_doubled" || afp === "lt20_gradual") {
        return {
          lr: "US-1 with positive AFP",
          rec: "AFP dương tính nhưng US không phải US-3: CEUS ít giúp. Nên MRI/CT chẩn đoán.",
        };
      }
      if (!vis) return { lr: "", rec: "" };
      if (vis === "A" || vis === "B") {
        return { lr: "US-1 (Âm tính)", rec: "Lặp lại US sau 6 tháng." };
      }
      return {
        lr: "US-1 (Âm tính) với VIS-C",
        rec: "Hạn chế nặng VIS-C. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US 3 tháng; nếu vẫn VIS-C, cân nhắc chiến lược thay thế.",
      };
    }

    if (obsKind === "lt10_not_def_benign") {
      if (!afp) return { lr: "", rec: "" };
      if (afp === "ge20" || afp === "lt20_doubled" || afp === "lt20_gradual") {
        return {
          lr: "US-2 (Dưới ngưỡng) with positive AFP",
          rec: "AFP dương tính nhưng chưa US-3: CEUS ít giúp. Nên MRI/CT chẩn đoán.",
        };
      }
      if (!vis) return { lr: "", rec: "" };
      if (vis === "A" || vis === "B") {
        return {
          lr: "US-2 (Dưới ngưỡng)",
          rec: "Lặp lại US mỗi 3–6 tháng trong 2 lần. Nếu mất tổn thương hoặc vẫn <10 mm, có thể xếp US-1 và quay lại chu kỳ 6 tháng.",
        };
      }
      return {
        lr: "US-2 (Dưới ngưỡng) với VIS-C",
        rec: "Hạn chế nặng VIS-C. Nếu MASH/EtOH, CTP-B/C, hoặc BMI ≥ 35: cân nhắc AMRI/CT. Nếu không, lặp US 3 tháng; nếu vẫn VIS-C, cân nhắc chiến lược thay thế.",
      };
    }
  }

  return { lr: "", rec: "" };
};

/* ====================== COMPONENT ====================== */
export default function USSurveillanceForm() {
  const [form] = Form.useForm();

  // State
  const [usHighRisk, setUsHighRisk] = useState(null);
  const [usFindings, setUsFindings] = useState(null);
  const [usObsKind, setUsObsKind] = useState(null);
  const [usAFP, setUsAFP] = useState(null);
  const [usVIS, setUsVIS] = useState(null);

  // Kết quả
  const [lrCategory, setLrCategory] = useState("");
  const [lrRecommendation, setLrRecommendation] = useState("");

  const onReset = () => {
    form.resetFields();
    setUsHighRisk(null);
    setUsFindings(null);
    setUsObsKind(null);
    setUsAFP(null);
    setUsVIS(null);
    setLrCategory("");
    setLrRecommendation("");
  };

  const computeUS = () =>
    computeUSSurveillance(usHighRisk, usFindings, usObsKind, usAFP, usVIS);

  const genHtml = async () => {
    const rows = [];

    rows.push([
      "US – Người bệnh nguy cơ cao HCC?",
      getLabel(US_HIGH_RISK_OPTIONS, usHighRisk),
    ]);

    if (usHighRisk === "yes") {
      rows.push([
        "US – Phát hiện gì?",
        getLabel(US_FINDINGS_OPTIONS, usFindings),
      ]);

      if (usFindings === "no_findings") {
        rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
        if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
          rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
        }
      }

      if (usFindings === "observations") {
        rows.push([
          "Loại observation(s)",
          getLabel(US_OBS_KIND_OPTIONS, usObsKind),
        ]);

        if (usObsKind === "only_definitely_benign") {
          rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
          if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
            rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
          }
        }

        if (usObsKind === "lt10_not_def_benign") {
          rows.push(["AFP", getLabel(US_AFP_OPTIONS, usAFP)]);
          if (usAFP === "lt20_no_increase" || usAFP === "unknown") {
            rows.push(["US – VIS score", getLabel(US_VIS_OPTIONS, usVIS)]);
          }
        }
      }

      if (usFindings === "new_thrombus") {
        // nothing extra
      }
    }

    let result = { lr: "", rec: "" };
    try {
      result = computeUS();
    } catch {
      result = { lr: "—", rec: "" };
    }

    const tableRows = rows
      .map(
        ([k, v]) =>
          `<tr><td style="width:36%">${k}</td><td>${
            typeof v === "string" ? v : v ?? "--"
          }</td></tr>`
      )
      .join("");

    const html = `
      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
        <caption><strong>LI-RADS – US Surveillance</strong></caption>
        <tr><th style="width:36%">Mục</th><th>Giá trị</th></tr>
        ${tableRows}
        <tr>
          <td><strong>Kết luận</strong></td>
          <td><strong>${result.lr || "—"}</strong></td>
        </tr>
        <tr>
          <td><strong>Khuyến nghị</strong></td>
          <td>${(result.rec || "").replace(/\n/g, "<br/>")}</td>
        </tr>
      </table>
    `;

    setLrCategory(result.lr || "");
    setLrRecommendation(result.rec || "");
    return html;
  };

  const onFinish = async () => {
    try {
      await genHtml();
      toast.success("Đã tạo bảng kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  const onCalculate = async () => {
    try {
      const { lr, rec } = computeUS();
      setLrCategory(lr || "—");
      setLrRecommendation(rec || "");
      await genHtml();
      toast.success("Đã tính kết quả!");
    } catch (e) {
      toast.error(e?.message || "Vui lòng nhập đủ thông tin hợp lệ!");
    }
  };

  const onCopy = async () => {
    try {
      const html = await genHtml();
      if (window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([html.replace(/<[^>]+>/g, "")], {
              type: "text/plain",
            }),
          }),
        ]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(html.replace(/<[^>]+>/g, ""));
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = html.replace(/<[^>]+>/g, "");
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
      }
      toast.success("Đã copy bảng HTML vào clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể copy. Vui lòng thử lại!");
    }
  };

  /* ====================== UI ====================== */
  return (
    <div>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Divider />
          <Title level={5} style={{ marginTop: 0 }}>
            Sàng lọc/theo dõi HCC bằng siêu âm
          </Title>

          <Form.Item
            label="Người bệnh có thuộc nhóm nguy cơ cao HCC? *"
            required
          >
            <Radio.Group
              value={usHighRisk}
              onChange={(e) => {
                const next = e.target.value;
                setUsHighRisk(next);
                setUsFindings(null);
                setUsObsKind(null);
                setUsAFP(null);
                setUsVIS(null);
                setLrCategory("");
                setLrRecommendation("");
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {US_HIGH_RISK_OPTIONS.map((o) => (
                  <Radio key={o.value} value={o.value}>
                    {o.label}
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>

          {usHighRisk === "yes" && (
            <>
              <Form.Item label="Bạn có phát hiện gì? *" required>
                <Radio.Group
                  value={usFindings}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUsFindings(next);
                    setUsObsKind(null);
                    setUsAFP(null);
                    setUsVIS(null);
                    setLrCategory("");
                    setLrRecommendation("");
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {US_FINDINGS_OPTIONS.map((o) => (
                      <Radio key={o.value} value={o.value}>
                        {o.label}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              {usFindings === "no_findings" && (
                <>
                  <Form.Item label="Mức AFP huyết thanh? *" required>
                    <Radio.Group
                      value={usAFP}
                      onChange={(e) => {
                        const next = e.target.value;
                        setUsAFP(next);
                        if (next !== "lt20_no_increase" && next !== "unknown") {
                          setUsVIS(null);
                        }
                        setLrCategory("");
                        setLrRecommendation("");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {US_AFP_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                  </Form.Item>

                  {(usAFP === "lt20_no_increase" || usAFP === "unknown") && (
                    <Form.Item label="Điểm trực quan hóa (VIS)? *" required>
                      <Radio.Group
                        value={usVIS}
                        onChange={(e) => {
                          setUsVIS(e.target.value);
                          setLrCategory("");
                          setLrRecommendation("");
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {US_VIS_OPTIONS.map((o) => (
                            <Radio key={o.value} value={o.value}>
                              {o.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                      <div
                        style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}
                      >
                        <div>
                          <strong>Ví dụ VIS-A:</strong> Gan đồng nhất/ít dị
                          đồng; suy giảm tia/bóng tối thiểu; thấy gần như toàn
                          bộ gan.
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <strong>Ví dụ VIS-B:</strong> Dị đồng nhu mô có thể
                          che tổn thương nhỏ; suy giảm tia/bóng mức vừa; một
                          phần gan/cơ hoành không thấy.
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <strong>Ví dụ VIS-C:</strong> Dị đồng nặng; suy giảm
                          tia/bóng nặng; &gt;50% thùy không thấy hoặc &gt;50% cơ
                          hoành không thấy.
                        </div>
                      </div>
                    </Form.Item>
                  )}
                </>
              )}

              {usFindings === "observations" && (
                <>
                  <Form.Item
                    label="Mô tả phù hợp nhất cho observation(s)? *"
                    required
                  >
                    <Radio.Group
                      value={usObsKind}
                      onChange={(e) => {
                        const next = e.target.value;
                        setUsObsKind(next);
                        setUsAFP(null);
                        setUsVIS(null);
                        setLrCategory("");
                        setLrRecommendation("");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {US_OBS_KIND_OPTIONS.map((o) => (
                          <Radio key={o.value} value={o.value}>
                            {o.label}
                          </Radio>
                        ))}
                      </div>
                    </Radio.Group>
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      <em>
                        (*) Lành tính chắc chắn: nang đơn thuần, mỡ quanh túi
                        mật, hemangioma đã xác nhận, ...
                      </em>
                    </div>
                  </Form.Item>

                  {usObsKind === "only_definitely_benign" && (
                    <>
                      <Form.Item label="Mức AFP huyết thanh? *" required>
                        <Radio.Group
                          value={usAFP}
                          onChange={(e) => {
                            const next = e.target.value;
                            setUsAFP(next);
                            if (
                              next !== "lt20_no_increase" &&
                              next !== "unknown"
                            ) {
                              setUsVIS(null);
                            }
                            setLrCategory("");
                            setLrRecommendation("");
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {US_AFP_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {(usAFP === "lt20_no_increase" ||
                        usAFP === "unknown") && (
                        <Form.Item label="Điểm trực quan hóa (VIS)? *" required>
                          <Radio.Group
                            value={usVIS}
                            onChange={(e) => {
                              setUsVIS(e.target.value);
                              setLrCategory("");
                              setLrRecommendation("");
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {US_VIS_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>
                      )}
                    </>
                  )}

                  {usObsKind === "lt10_not_def_benign" && (
                    <>
                      <Form.Item label="Mức AFP huyết thanh? *" required>
                        <Radio.Group
                          value={usAFP}
                          onChange={(e) => {
                            const next = e.target.value;
                            setUsAFP(next);
                            if (
                              next !== "lt20_no_increase" &&
                              next !== "unknown"
                            ) {
                              setUsVIS(null);
                            }
                            setLrCategory("");
                            setLrRecommendation("");
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {US_AFP_OPTIONS.map((o) => (
                              <Radio key={o.value} value={o.value}>
                                {o.label}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      </Form.Item>

                      {(usAFP === "lt20_no_increase" ||
                        usAFP === "unknown") && (
                        <Form.Item label="Điểm trực quan hóa (VIS)? *" required>
                          <Radio.Group
                            value={usVIS}
                            onChange={(e) => {
                              setUsVIS(e.target.value);
                              setLrCategory("");
                              setLrRecommendation("");
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {US_VIS_OPTIONS.map((o) => (
                                <Radio key={o.value} value={o.value}>
                                  {o.label}
                                </Radio>
                              ))}
                            </div>
                          </Radio.Group>
                        </Form.Item>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          <Divider />

          {/* Kết quả realtime */}
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Kết luận: </Text>
              <Text type="danger">{lrCategory || "—"}</Text>
            </Col>
            <Col span={24} style={{ marginTop: 8, whiteSpace: "pre-line" }}>
              <Text italic>{lrRecommendation}</Text>
            </Col>
          </Row>

          <Divider />
          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
            <Button onClick={onCalculate}>Kết quả</Button>
            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy kết quả
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
