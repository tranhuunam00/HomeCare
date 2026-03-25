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
import styles from "./ColorectalcancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Colorectalcancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const ColorectalcancerForm = () => {
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
      if (val === "yes") return "Có";
      if (val === "no") return "Không";
      return "Không rõ";
    };

    const levelMap = {
      T1: "Xâm lấn lớp dưới niêm mạc",
      T2: "Xâm lấn lớp cơ",
      T3: "Xâm lấn dưới thanh mạc / mô quanh đại trực tràng",
      T4a: "Xuyên phúc mạc tạng",
      T4b: "Xâm lấn cơ quan khác",
      TX: "Không đánh giá được",
    };

    const mMap = {
      M0: "Không có di căn xa",
      M1a: "Di căn 1 cơ quan",
      M1b: "Di căn nhiều cơ quan",
      M1c: "Di căn phúc mạc",
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
    <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ ĐẠI TRỰC TRÀNG (TNM)</h2>

    <!-- T -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
      <caption><strong>1. Khối u nguyên phát (T)</strong></caption>

      <tr>
        <td><strong>Mức độ xâm lấn</strong></td>
        <td>${levelMap[values.level_inv] || "Không rõ"}</td>
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
        <td><strong>Số hạch dương tính</strong></td>
        <td>${values.pos_num ?? "Không rõ"}</td>
      </tr>

      <tr>
        <td><strong>Ổ lắng đọng u (tumour deposits)</strong></td>
        <td>${yesNo(values.tumour_deposits)}</td>
      </tr>

      <tr>
        <td><strong>Kết luận N</strong></td>
        <td><strong style="color:red;">${summary.N || ""}</strong></td>
      </tr>
    </table>

    <!-- M -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>3. Di căn xa (M)</strong></caption>

      <tr>
        <td><strong>Di căn</strong></td>
        <td>${mMap[values.distant_metastases] || "Không rõ"}</td>
      </tr>

      <tr>
        <td><strong>Kết luận M</strong></td>
        <td><strong style="color:red;">${summary.M || ""}</strong></td>
      </tr>
    </table>

    <!-- KẾT LUẬN -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>4. Kết luận TNM</strong></caption>

      <tr>
        <td><strong>Stage Group (SG)</strong></td>
        <td>${summary.SG || ""}</td>
      </tr>

      <tr>
        <td><strong>Phân loại đơn giản</strong></td>
        <td>${summary.SimpG || ""}</td>
      </tr>

      <tr>
        <td><strong>Stage Range</strong></td>
        <td>${summary.range || ""}</td>
      </tr>

      <tr>
        <td><strong>TNM đầy đủ</strong></td>
        <td>${summary.TNM || ""}</td>
      </tr>
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

Dưới đây là kết quả phân loại ung thư đại trực tràng theo TNM:
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
          name={"TNM-Colorectal"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư đại trực tràng theo phiên bản TNM Edition 8"
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
                  name="level_inv"
                  label={
                    <LabelWithHint
                      text="Mức độ xâm lấn khối u (Level of invasion)"
                      image="/product/cancer/colorectal/T_invasion.png"
                    />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="T1">
                      Xâm lấn lớp dưới niêm mạc (Submucosa)
                    </Radio>
                    <Radio value="T2">
                      Xâm lấn lớp cơ (Muscularis propria)
                    </Radio>
                    <Radio value="T3">
                      Xâm lấn lớp dưới thanh mạc hoặc mô quanh đại trực tràng
                    </Radio>
                    <Radio value="T4a">Xuyên qua phúc mạc tạng</Radio>
                    <Radio value="T4b">
                      Xâm lấn trực tiếp hoặc dính vào cơ quan khác
                    </Radio>
                    <Radio value="TX">Không đánh giá được</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ level_inv: "TX" });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>

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
                      text="Số lượng hạch vùng dương tính"
                      image="/product/cancer/colorectal/N_positiven.png"
                    />
                  }
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  name="tumour_deposits"
                  label={
                    <LabelWithHint text="Ổ lắng đọng u (tumour deposits), tức là các 'vệ tinh' ở lớp dưới thanh mạc hoặc trong mô mềm quanh đại tràng / trực tràng không được phủ phúc mạc" />
                  }
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
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
                  <Radio.Group>
                    <Radio value="M0">Không có di căn xa</Radio>

                    <Radio value="M1a">
                      Di căn đến một cơ quan hoặc vị trí (ví dụ: gan, phổi,
                      buồng trứng, hạch ngoài vùng), không có di căn phúc mạc
                    </Radio>

                    <Radio value="M1b">Di căn đến nhiều hơn một cơ quan</Radio>

                    <Radio value="M1c">
                      Di căn phúc mạc, có hoặc không kèm di căn cơ quan khác
                    </Radio>
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

export default ColorectalcancerForm;
