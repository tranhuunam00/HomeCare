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
import styles from "./LungcancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Lungcancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const LungcancerForm = () => {
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

  const onCalculate = async () => {
    try {
      const stage = getStage(summary.T, summary.N, summary.M);

      setSummary({
        ...summary,
        ...stage,
      });
    } catch (err) {
      toast.error("Vui lòng nhập đầy đủ!");
    }
  };

  const genHtml = (isCopy = false) => {
    const values = form.getFieldsValue();

    const yesNo = (val) => {
      if (val === 1) return "Có";
      if (val === 0) return "Không";
      return "Không rõ";
    };

    const bronchialMap = {
      0: "Không xâm lấn phế quản chính",
      1: "Xâm lấn phế quản chính",
      2: "Xâm lấn carina / khí quản",
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
    <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ PHỔI (TNM)</h2>

    <!-- THÔNG TIN KHỐI U -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
      <caption><strong>1. Đặc điểm khối u nguyên phát (T)</strong></caption>

      <tr><td><strong>MIA</strong></td><td>${yesNo(values.mia)}</td></tr>
      <tr><td><strong>Kích thước u xâm lấn</strong></td><td>${values.tumor_size || ""} cm</td></tr>
      <tr><td><strong>Xâm lấn phế quản</strong></td><td>${bronchialMap[values.bronchial_inv] || "Không rõ"}</td></tr>
      <tr><td><strong>Xâm lấn màng phổi tạng</strong></td><td>${yesNo(values.pleura_visceral)}</td></tr>
      <tr><td><strong>Xẹp phổi / viêm phổi tắc nghẽn</strong></td><td>${yesNo(values.atelectasis)}</td></tr>
      <tr><td><strong>Xâm lấn thành ngực / cơ hoành</strong></td><td>${yesNo(values.chest_wall_inv)}</td></tr>
      <tr><td><strong>Nốt cùng thùy</strong></td><td>${yesNo(values.same_lobe_nodules)}</td></tr>
      <tr><td><strong>Nốt khác thùy cùng bên</strong></td><td>${yesNo(values.diff_lobe_nodules)}</td></tr>
      <tr><td><strong>Xâm lấn cấu trúc quan trọng</strong></td><td>${yesNo(values.critical_struct_inv)}</td></tr>

      <tr>
        <td><strong>Kết luận T</strong></td>
        <td><strong style="color:red;">${summary.T || ""}</strong></td>
      </tr>
    </table>

    <!-- HẠCH -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>2. Hạch bạch huyết vùng (N)</strong></caption>

      <tr>
        <td><strong>Phân loại N</strong></td>
        <td>${summary.N || ""}</td>
      </tr>
    </table>

    <!-- DI CĂN -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>3. Di căn xa (M)</strong></caption>

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

Dưới đây là kết quả phân loại ung thư phổi theo TNM:
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
          name={"TNM-Lung"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư phổi theo phiên bản TNM Edition 8"
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
                name="mia"
                label={
                  <LabelWithHint
                    text="Ung thư biểu mô tuyến xâm lấn tối thiểu"
                    note="Ung thư biểu mô tuyến xâm lấn tối thiểu:
Khối u đơn độc ≤ 3 cm, kiểu phát triển lepidic chiếm ưu thế, với phần xâm lấn ≤ 5 mm."
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
                name="tumor_size"
                label={
                  <LabelWithHint
                    text="Kích thước phần u xâm lấn (cm)"
                    image="/product/cancer/T_size.png"
                  />
                }
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item name="bronchial_inv" label="Xâm lấn phế quản">
                  <Radio.Group>
                    <Radio value={0}>Không xâm lấn phế quản chính</Radio>
                    <Radio value={1}>Xâm lấn phế quản chính</Radio>
                    <Radio value={2}>Xâm lấn carina hoặc khí quản</Radio>
                  </Radio.Group>
                </Form.Item>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ bronchial_inv: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>
              <Form.Item name="pleura_visceral" label="Xâm lấn màng phổi tạng">
                <Radio.Group>
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
                  <Radio value={-1}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="atelectasis"
                label={
                  <LabelWithHint
                    text="Xẹp phổi hoặc viêm phổi tắc nghẽn"
                    image="/product/cancer/T_atelectasis.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value={1}>Có (một phần hoặc toàn bộ phổi)</Radio>
                  <Radio value={0}>Không</Radio>
                  <Radio value={-1}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="chest_wall_inv"
                label="Xâm lấn thành ngực / thần kinh hoành / màng phổi thành / màng ngoài tim"
              >
                <Radio.Group>
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
                  <Radio value={-1}>Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="same_lobe_nodules"
                label={
                  <LabelWithHint
                    text="Nốt u riêng biệt cùng thùy"
                    image="/product/cancer/T_nodulest3.png"
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
                name="diff_lobe_nodules"
                label={
                  <LabelWithHint
                    text="Nốt u ở thùy khác cùng bên"
                    image="/product/cancer/T_nodulest4.png"
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
                name="critical_struct_inv"
                label={
                  <LabelWithHint
                    text="Xâm lấn cơ hoành / trung thất / tim / mạch lớn / TK quặt ngược / cột sống / thực quản"
                    image="/product/cancer/T_t4invasion.png"
                  />
                }
                style={{ marginBottom: 0 }}
              >
                <Radio.Group style={{ marginBottom: 0 }}>
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
                  name="regional_lymph_nodes"
                  label={
                    <LabelWithHint
                      text="Hạch bạch huyết vùng (Regional lymph nodes)"
                      image="/product/cancer/N_nregion.png"
                    />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="NX">Không đánh giá được (NX)</Radio>
                    <Radio value="N0">Không có di căn hạch vùng</Radio>

                    <Radio value="N1">
                      Di căn hạch quanh phế quản cùng bên và/hoặc hạch rốn phổi
                      cùng bên và hạch trong phổi
                    </Radio>

                    <Radio value="N2">
                      Di căn hạch trung thất cùng bên và/hoặc hạch dưới carina
                    </Radio>

                    <Radio value="N3">
                      Di căn hạch trung thất đối bên, hạch rốn phổi đối bên,
                      hạch cơ thang (scalene) cùng hoặc đối bên, hoặc hạch
                      thượng đòn
                    </Radio>
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

                    <Radio value="M1a">
                      Có nốt u riêng biệt ở thùy đối bên hoặc có nốt màng phổi /
                      tràn dịch màng phổi (hoặc màng tim) ác tính
                    </Radio>

                    <Radio value="M1b">
                      Di căn ngoài lồng ngực đơn độc ở một cơ quan
                    </Radio>

                    <Radio value="M1c">
                      Di căn ngoài lồng ngực nhiều ổ ở một hoặc nhiều cơ quan
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

export default LungcancerForm;
