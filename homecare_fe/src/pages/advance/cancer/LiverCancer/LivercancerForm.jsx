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
import styles from "./LivercancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Livercancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const LivercancerForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({
    T: "TX",
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
    const values = form.getFieldsValue();

    const yesNo = (val) => {
      if (val === 1) return "Có";
      if (val === 0) return "Không";
      return "Không rõ";
    };

    const tumourMap = {
      single: "Khối u đơn độc",
      multiple: "Nhiều khối u",
    };

    const vascularMap = {
      none: "Không xâm lấn mạch máu",
      minor: "Có xâm lấn mạch máu",
      major: "Xâm lấn nhánh lớn của tĩnh mạch cửa hoặc tĩnh mạch gan",
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
    <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ GAN (TNM)</h2>

    <!-- T -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
      <caption><strong>1. Đặc điểm khối u nguyên phát (T)</strong></caption>

      <tr><td><strong>Số lượng khối u</strong></td><td>${tumourMap[values.tumour_count] || "Không rõ"}</td></tr>
      <tr><td><strong>Kích thước lớn nhất</strong></td><td>${values.tumor_size || ""} cm</td></tr>
      <tr><td><strong>Xâm lấn mạch máu</strong></td><td>${vascularMap[values.vascular_invasion] || "Không rõ"}</td></tr>
      <tr><td><strong>Xâm lấn cơ quan lân cận</strong></td><td>${yesNo(values.adjacent_organs_invasion)}</td></tr>
      <tr><td><strong>Xuyên thủng phúc mạc tạng</strong></td><td>${yesNo(values.peritoneum_perforation)}</td></tr>

      <tr>
        <td><strong>Kết luận T</strong></td>
        <td><strong style="color:red;">${summary.T || ""}</strong></td>
      </tr>
    </table>

    <!-- N -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>2. Hạch bạch huyết vùng (N)</strong></caption>

      <tr>
        <td><strong>Số hạch dương tính</strong></td>
        <td>${values.pos_num ?? "Không rõ"}</td>
      </tr>

      <tr>
        <td><strong>Phân loại N</strong></td>
        <td>${summary.N || ""}</td>
      </tr>
    </table>

    <!-- M -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>3. Di căn xa (M)</strong></caption>

      <tr>
        <td><strong>Di căn xa</strong></td>
        <td>${
          values.distant_metastases === "M1"
            ? "Có di căn xa"
            : "Không có di căn xa"
        }</td>
      </tr>

      <tr>
        <td><strong>Phân loại M</strong></td>
        <td>${summary.M || ""}</td>
      </tr>
    </table>

    <!-- KẾT LUẬN -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>4. Kết luận TNM</strong></caption>

      <tr><td><strong>Stage Group (SG)</strong></td><td>${summary.SG || ""}</td></tr>
      <tr><td><strong>Phân loại đơn giản</strong></td><td>${summary.SimpG || ""}</td></tr>
      <tr><td><strong>Stage Range</strong></td><td>${summary.range || ""}</td></tr>
      <tr><td><strong>TNM đầy đủ</strong></td><td>${summary.TNM || ""}</td></tr>
    </table>

    ${
      isCopy && summary.ai
        ? `<div style="margin-top:20px;">
            <strong>5. Khuyến nghị:</strong>
            ${bulletHtml}
          </div>`
        : ""
    }
  `;

    return `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body style="font-family: Arial, sans-serif; font-size:14px;">
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

Dưới đây là kết quả phân loại ung thư gan theo TNM:
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
          link={"https://home-care.vn/product/phan-mem-d-lungrads/"}
          name={"TNM-Liver"}
          desc={"Hệ thống phân loại giai đoạn ung thư gan theo TNM"}
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
              N: getN(form.getFieldsValue()) || "NX",
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item
                  name="tumour_count"
                  label={
                    <LabelWithHint
                      text="Khối u đơn độc hoặc nhiều khối u"
                      image="/product/cancer/liver/T_solitary.png"
                    />
                  }
                >
                  <Radio.Group>
                    <Radio value="single">Khối u đơn độc</Radio>
                    <Radio value="multiple">Nhiều khối u</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ tumour_count: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>

              <Form.Item
                name="tumor_size"
                label={
                  <LabelWithHint
                    text="Kích thước lớn nhất của khối u (cm)"
                    image="/product/cancer/liver/T_size.png"
                  />
                }
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item
                  name="vascular_invasion"
                  label={
                    <LabelWithHint
                      text="Xâm lấn mạch máu"
                      image="/product/cancer/liver/T_vascular.png"
                    />
                  }
                >
                  <Radio.Group>
                    <Radio value="none">Không xâm lấn mạch máu</Radio>
                    <Radio value="minor">Có xâm lấn mạch máu</Radio>
                    <Radio value="major">
                      Xâm lấn nhánh lớn của tĩnh mạch cửa hoặc tĩnh mạch gan
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ vascular_invasion: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>
              <Form.Item
                name="adjacent_organs_invasion"
                label={
                  <LabelWithHint
                    text="Khối u xâm lấn trực tiếp các cơ quan lân cận (không bao gồm túi mật)"
                    image="/product/cancer/liver/T_vascular.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
                  <Radio value={-1}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="peritoneum_perforation"
                label={
                  <LabelWithHint
                    text="Khối u xuyên thủng phúc mạc tạng"
                    image="/product/cancer/liver/T_visceral.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
                  <Radio value={-1}>Không rõ</Radio>
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
                  name="pos_num"
                  label={
                    <LabelWithHint
                      text="Số lượng hạch bạch huyết vùng dương tính"
                      image="/product/cancer/liver/N_positiven.png"
                    />
                  }
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>

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
                    <LabelWithHint text="Di căn xa (Distant metastases)" />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="M0">Không có di căn xa</Radio>

                    <Radio value="M1">Có di căn xa</Radio>
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

export default LivercancerForm;
