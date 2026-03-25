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
import styles from "./OesophaguscancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Oesophaguscancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const OesophaguscancerForm = () => {
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({
    T: "TX",
    N: "NX",
    M: "M0",
    SG: "",
    SimpG: "",
    range: "",
    TNM: "",
    morphology: null,
    assessment_type: null,
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

    // ===== MAP =====
    const levelMap = {
      T0: "Ung thư tại chỗ (không xâm lấn)",
      T1a: "Xâm lấn lớp niêm mạc",
      T1b: "Xâm lấn lớp dưới niêm mạc",
      T2: "Xâm lấn lớp cơ",
      T3: "Xâm lấn lớp áo ngoài (adventitia)",
      T4a: "Xâm lấn cấu trúc lân cận có thể phẫu thuật",
      T4b: "Xâm lấn cấu trúc quan trọng không phẫu thuật được",
      TX: "Không đánh giá được",
    };

    const mMap = {
      M0: "Không có di căn xa",
      M1: "Có di căn xa",
    };

    const morphologyMap = {
      adenocarcinoma: "Ung thư biểu mô tuyến",
      squamous: "Ung thư biểu mô tế bào vảy",
    };

    const arteryMap = {
      none: "Không xâm lấn động mạch lớn",
      coeliac: "Xâm lấn thân tạng (coeliac axis)",
      sma: "Xâm lấn động mạch mạc treo tràng trên (SMA)",
      cha: "Xâm lấn động mạch gan chung (CHA)",
      multiple: "Xâm lấn nhiều động mạch (coeliac axis/SMA/CHA)",
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

    // ===== BODY =====
    const body = `
  <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ THỰC QUẢN (TNM)</h2>

  <!-- THÔNG TIN CHUNG -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
    <caption><strong>1. Thông tin chung</strong></caption>

    <tr>
      <td><strong>Hình thái mô bệnh học</strong></td>
      <td>${morphologyMap[values.morphology] || "Không rõ"}</td>
    </tr>

    <tr>
      <td><strong>Loại đánh giá</strong></td>
      <td>
        ${
          values.assessment_type === "pathological"
            ? "Giải phẫu bệnh (pTNM)"
            : values.assessment_type === "clinical"
              ? "Lâm sàng (cTNM)"
              : "Không rõ"
        }
      </td>
    </tr>
  </table>

  <!-- T -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>2. Khối u nguyên phát (T)</strong></caption>

    <tr>
      <td><strong>Mức độ xâm lấn</strong></td>
      <td>${levelMap[values.level_inv] || "Không rõ"}</td>
    </tr>

    <tr>
      <td><strong>Kết luận T</strong></td>
      <td><strong style="color:red;">${summary.T || ""}</strong></td>
    </tr>
  </table>

  <!-- XÂM LẤN MẠCH -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>3. Xâm lấn mạch máu lớn</strong></caption>

    <tr>
      <td><strong>Tình trạng</strong></td>
      <td>${arteryMap[values.arterial_involvement] || "Không rõ"}</td>
    </tr>
  </table>

  <!-- N -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>4. Hạch vùng (N)</strong></caption>

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
    <caption><strong>5. Di căn xa (M)</strong></caption>

    <tr>
      <td><strong>Tình trạng di căn</strong></td>
      <td>${mMap[values.distant_metastases] || "Không rõ"}</td>
    </tr>

    <tr>
      <td><strong>Kết luận M</strong></td>
      <td><strong style="color:red;">${summary.M || ""}</strong></td>
    </tr>
  </table>

  <!-- KẾT LUẬN -->
  <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
    <caption><strong>6. Kết luận TNM</strong></caption>

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
      <td><strong>${summary.TNM || ""}</strong></td>
    </tr>
  </table>

  ${
    isCopy && summary.ai
      ? `
      <div style="margin-top:20px;">
        <strong>7. Khuyến nghị:</strong>
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

    const stage = getStage(
      summary.T,
      summary.N,
      summary.M,
      summary.morphology,
      summary.assessment_type,
    );

    setSummary((prev) => ({
      ...prev,
      ...stage,
    }));
  }, [
    summary.T,
    summary.N,
    summary.M,
    summary.morphology,
    summary.assessment_type,
  ]);

  const handleAI = async () => {
    try {
      const html = genHtml(false);

      const prompt = `
Bạn là bác sĩ chẩn đoán hình ảnh.

Dưới đây là kết quả phân loại ung thư thực quản
 theo TNM:
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
          name={"TNM-Oesophagus"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư thực quản theo phiên bản TNM Edition 8"
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
            <div style={{ flex: 3 }}>
              <div className={styles.sectionBlockT}>
                <div className={styles.sectionHeaderT}>
                  T – Khối u nguyên phát (Tumor)
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Form.Item
                    name="level_inv"
                    label={
                      <LabelWithHint text="Mức độ xâm lấn khối u (Level of invasion)" />
                    }
                  >
                    <Radio.Group
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Radio value="T0">Ung thư tại chỗ (không xâm lấn)</Radio>

                      <Radio value="T1a">
                        Xâm lấn lớp niêm mạc (lamina propria hoặc muscularis
                        mucosae)
                      </Radio>

                      <Radio value="T1b">
                        Xâm lấn lớp dưới niêm mạc (submucosa)
                      </Radio>

                      <Radio value="T2">
                        Xâm lấn lớp cơ (muscularis propria)
                      </Radio>

                      <Radio value="T3">
                        Xâm lấn lớp áo ngoài (adventitia)
                      </Radio>

                      <Radio value="T4a">
                        Xâm lấn cấu trúc lân cận có thể phẫu thuật (màng phổi,
                        màng tim, cơ hoành...)
                      </Radio>

                      <Radio value="T4b">
                        Xâm lấn cấu trúc quan trọng không phẫu thuật được (động
                        mạch chủ, khí quản, thân đốt sống...)
                      </Radio>

                      <Radio value="TX">
                        Không đánh giá được mức độ xâm lấn
                      </Radio>
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
              <div className={styles.sectionBlockT}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Form.Item
                    name="morphology"
                    label="Hình thái mô bệnh học (Morphology)"
                  >
                    <Radio.Group
                      onChange={(e) => {
                        setSummary((prev) => ({
                          ...prev,
                          morphology: e.target.value,
                        }));
                      }}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Radio value="adenocarcinoma">
                        Ung thư biểu mô tuyến
                      </Radio>
                      <Radio value="squamous">Ung thư biểu mô tế bào vảy</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Button
                    onClick={() => {
                      form.setFieldsValue({ morphology: "TX" });
                      setSummary((prev) => ({
                        ...prev,
                        morphology: null,
                      }));
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Form.Item
                    name="assessment_type"
                    label="Loại đánh giá (Pathological / Clinical)"
                  >
                    <Radio.Group
                      onChange={(e) => {
                        setSummary((prev) => ({
                          ...prev,
                          assessment_type: e.target.value,
                        }));
                      }}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Radio value="pathological">Giải phẫu bệnh - pTNM</Radio>
                      <Radio value="clinical">Lâm sàng - cTNM</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Button
                    onClick={() => {
                      form.setFieldsValue({ assessment_type: "TX" });
                      setSummary((prev) => ({
                        ...prev,
                        assessment_type: null,
                      }));
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
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
                        image="/product/cancer/oesophagus/N_positiven.png"
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
                      <LabelWithHint
                        text="Di căn xa (Distant metastases)"
                        image="/product/cancer/oesophagus/M_m.png"
                      />
                    }
                  >
                    <Radio.Group>
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

export default OesophaguscancerForm;
