import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Radio,
  InputNumber,
} from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import styles from "./KidneycancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Kidneycancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const KidneycancerForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({
    T: "",
    N: "NX",
    M: "M0",
    SG: "",
    SimpG: "",
    range: "",
    TNM: "",
  });
  const [ai, setAI] = useState("");

  const onReset = () => {
    form.resetFields();
    setSummary({ T: "TX", N: "NX", M: "M0", stage: "" });
  };

  const genHtml = (isCopy = false) => {
    const v = form.getFieldsValue();

    const yesNo = (val) => {
      if (val === "yes") return "Có";
      if (val === "no") return "Không";
      return "Không rõ";
    };

    const bulletHtml = `
    <ul style="margin-top:8px; padding-left:20px;">
      ${(summary.ai || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .map((line) => `<li>${line.replace(/^[-•*]\s*/, "")}</li>`)
        .join("")}
    </ul>
  `;

    const body = `
  <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ THẬN (TNM)</h2>

  <!-- T -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
    <caption><strong>1. Khối u nguyên phát (T)</strong></caption>

    <tr>
      <td><strong>Kích thước lớn nhất (cm)</strong></td>
      <td>${v.tumor_size ?? "Không rõ"}</td>
    </tr>

    <tr>
      <td><strong>Khối u giới hạn trong thận</strong></td>
      <td>${yesNo(v.kidney_only)}</td>
    </tr>

    <tr>
      <td><strong>Xâm lấn tĩnh mạch thận / hệ đài bể thận</strong></td>
      <td>${yesNo(v.renal_vein)}</td>
    </tr>

    <tr>
      <td><strong>Xâm lấn mỡ quanh thận / xoang thận</strong></td>
      <td>${yesNo(v.perirenal_fat)}</td>
    </tr>

    <tr>
      <td><strong>Lan vào TM chủ dưới (dưới cơ hoành)</strong></td>
      <td>${yesNo(v.ivc_below)}</td>
    </tr>

    <tr>
      <td><strong>Lan vào TM chủ (trên cơ hoành / xâm lấn thành mạch)</strong></td>
      <td>${yesNo(v.ivc_above)}</td>
    </tr>

    <tr>
      <td><strong>Xâm lấn vượt Gerota / tuyến thượng thận</strong></td>
      <td>${yesNo(v.beyond_gerota)}</td>
    </tr>

    <tr>
      <td><strong>Kết luận T</strong></td>
      <td><strong style="color:red;">${summary.T || ""}</strong></td>
    </tr>
  </table>

  <!-- N -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>2. Hạch vùng (N)</strong></caption>

    <tr>
      <td><strong>Phân loại N</strong></td>
      <td>${summary.N || "NX"}</td>
    </tr>
  </table>

  <!-- M -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>3. Di căn xa (M)</strong></caption>

    <tr>
      <td><strong>Phân loại M</strong></td>
      <td>${summary.M || "M0"}</td>
    </tr>
  </table>

  <!-- TNM -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>4. Kết luận TNM</strong></caption>

    <tr><td><strong>Stage Group (SG)</strong></td><td>${summary.SG || ""}</td></tr>
    <tr><td><strong>Phân loại đơn giản</strong></td><td>${summary.SimpG || ""}</td></tr>
    <tr><td><strong>Stage Range</strong></td><td>${summary.range || ""}</td></tr>
    <tr><td><strong>TNM đầy đủ</strong></td><td><strong>${summary.TNM || ""}</strong></td></tr>
  </table>

  ${
    isCopy && summary.ai
      ? `
      <div style="margin-top:20px;">
        <strong>5. Khuyến nghị:</strong>
        ${bulletHtml}
      </div>
    `
      : ""
  }
  `;

    return `
  <html>
    <head>
      <meta charset="utf-8" />
    </head>
    <body style="font-family: Arial, sans-serif; font-size:14px; line-height:1.6;">
      ${body}
    </body>
  </html>
  `;
  };
  const onCopy = async () => {
    try {
      const html = genHtml(true);

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);

      toast.success("Đã copy!");
    } catch (e) {
      toast.error("Lỗi copy!");
    }
  };

  useEffect(() => {
    if (!summary.T || !summary.N || !summary.M) return;

    const stage = getStage(summary.T, summary.N, summary.M);

    setSummary((prev) => ({
      ...prev,
      ...stage,
    }));
  }, [summary.T, summary.N, summary.M]);

  const handleAI = async () => {
    try {
      const html = genHtml(false);

      const prompt = `
Bạn là bác sĩ chẩn đoán hình ảnh.

Dưới đây là kết quả phân loại ung thư thận theo TNM:
${html}

Hãy đưa ra:
- Nhận định chuyên môn
- Gợi ý hướng xử trí
- Viết ngắn gọn, rõ ràng, dùng bullet point
`;

      const res = await API_CALL.get(`/chatgpt/ask-gemini-recommendation`, {
        params: { prompt },
      });

      const cleaned =
        res.data.data
          ?.replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/^\* /gm, "• ") || "";

      setAI(cleaned);

      setSummary((prev) => ({
        ...prev,
        ai: cleaned,
      }));

      toast.success("AI đã đề xuất");
    } catch (e) {
      console.error(e);
      toast.error("Lỗi AI");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <ThamKhaoLinkHomeCare
          link={"https://home-care.vn/product/phan-mem-d-Kidneyrads/"}
          name={"TNM-Kidney"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư thận theo phiên bản TNM Edition 8"
          }
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            regional_lymph_nodes: "NX",
            distant_metastases: "M0",
          }}
          onValuesChange={(changed, all) => {
            setSummary((prev) => ({
              ...prev,
              N: all.regional_lymph_nodes || "NX",
              M: all.distant_metastases || "M0",
              T: getT(form.getFieldsValue()),
            }));
          }}
        >
          <div style={{ display: "flex" }}>
            <div className={styles.sectionBlockT}>
              <div className={styles.sectionHeaderT}>
                T – Khối u nguyên phát (Tumor)
              </div>

              <Form.Item
                name="tumor_size"
                label="Kích thước lớn nhất của khối u (cm)"
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="kidney_only" label="Khối u giới hạn trong thận">
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="renal_vein"
                label="U lan vào tĩnh mạch thận hoặc các nhánh của nó, hoặc xâm lấn hệ đài bể thận"
              >
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="perirenal_fat"
                label="U xâm lấn mỡ quanh thận và/hoặc xoang thận nhưng chưa vượt qua Gerota"
              >
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="ivc_below"
                label="U lan vào tĩnh mạch chủ dưới dưới cơ hoành"
              >
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="ivc_above"
                label="U lan vào tĩnh mạch chủ trên cơ hoành hoặc xâm lấn thành tĩnh mạch"
              >
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="beyond_gerota"
                label="U xâm lấn vượt quá Gerota (bao gồm lan tới tuyến thượng thận cùng bên)"
              >
                <Radio.Group>
                  <Radio value={"yes"}>Có</Radio>
                  <Radio value={"no"}>Không</Radio>
                  <Radio value={"unknown"}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <div className={styles.resultBoxT}>
                <span>Kết quả T:</span>
                <strong className={styles[summary.T]}>
                  {summary.T || "Chưa có"}
                </strong>
              </div>
            </div>
            <div>
              <div className={styles.sectionBlockN}>
                <div className={styles.sectionHeaderN}>
                  N – Hạch vùng (Node)
                </div>

                <Form.Item
                  name="regional_lymph_nodes"
                  label={
                    <LabelWithHint text="Hạch bạch huyết vùng (Regional lymph nodes)" />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="NX">Không đánh giá được hạch vùng (NX)</Radio>

                    <Radio value="N0">Không có di căn hạch vùng (N0)</Radio>

                    <Radio value="N1">Có di căn hạch vùng (N1)</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ regional_lymph_nodes: "NX" });
                    setSummary({ ...summary, N: "NX" });
                  }}
                >
                  Reset
                </Button>

                <div className={styles.resultBoxN}>
                  <span>Kết quả N:</span>
                  <strong className={styles[summary.N]}>
                    {summary.N || "Chưa có"}
                  </strong>
                </div>
              </div>

              <div className={styles.sectionBlockM}>
                <div className={styles.sectionHeaderM}>
                  M – Di căn xa (Metastasis)
                </div>

                <Form.Item
                  name="distant_metastases"
                  label={
                    <LabelWithHint
                      text="Di căn xa (Distant metastases)"
                      image="/product/cancer/M_m.png"
                    />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="M0">Không có di căn xa</Radio>
                    <Radio value="M1">Di căn xa</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ distant_metastases: "M0" });
                    setSummary({ ...summary, M: "M0" });
                  }}
                >
                  Reset
                </Button>
                <div className={styles.resultBoxM}>
                  <span>Kết quả M:</span>
                  <strong className={styles[summary.M]}>
                    {summary.M || "Chưa có"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.resultBox}>
            <p style={{ fontSize: 18 }}>
              <strong style={{ minWidth: 500, display: "inline-block" }}>
                Nhóm giai đoạn - SG:
              </strong>
              {summary.SG || ""}
            </p>
            <p style={{ fontSize: 18 }}>
              <strong style={{ minWidth: 500, display: "inline-block" }}>
                Phân loại đơn giản - SimpG:
              </strong>
              {summary.SimpG || ""}
            </p>
            <p style={{ fontSize: 18 }}>
              <strong style={{ minWidth: 500, display: "inline-block" }}>
                Khoảng giai đoạn chi tiết - Stage Range:
              </strong>
              {summary.range || ""}
            </p>
            <p style={{ fontSize: 18 }}>
              <strong style={{ minWidth: 500, display: "inline-block" }}>
                Công thức đầy đủ của phân loại ung thư - TNM:
              </strong>
              {summary.TNM || ""}
            </p>
          </div>

          <AIRecommendationEditor value={ai} onChange={setAI} />

          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
            <Button onClick={handleAI}>Đề xuất AI</Button>
            <Button icon={<CopyOutlined />} type="primary" onClick={onCopy}>
              Copy
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default KidneycancerForm;
