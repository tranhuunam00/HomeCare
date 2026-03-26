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
import styles from "./OvarycancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Ovarycancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const OvarycancerForm = () => {
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

    const mapOvary = {
      one: "Chỉ một buồng trứng",
      both: "Cả hai buồng trứng",
    };

    const tumourStatusMap = {
      intact:
        "Vỏ bao còn nguyên, không có u trên bề mặt buồng trứng hoặc ống dẫn trứng",
      ruptured_surgery: "Vỡ vỏ bao trong phẫu thuật (tràn tế bào u)",
      ruptured_before:
        "Vỡ vỏ bao trước phẫu thuật hoặc có u trên bề mặt buồng trứng/ống dẫn trứng",
      pelvic_implants:
        "Lan trong tiểu khung và/hoặc có cấy ghép trên tử cung, ống dẫn trứng hoặc buồng trứng",
      pelvic_extension:
        "Lan đến các mô khác trong tiểu khung (bao gồm ruột trong tiểu khung)",
      primary_peritoneal: "Ung thư phúc mạc nguyên phát",
    };

    const yesNo = (val) => {
      if (val === "yes") return "Có";
      if (val === "no") return "Không";
      return "Không rõ";
    };

    const ascitesMap = {
      yes: "Có tế bào ác tính",
      no: "Không có tế bào ác tính",
    };

    const extrapelvicMap = {
      none: "Không có tổn thương ngoài tiểu khung",
      microscopic: "Tổn thương phúc mạc ngoài tiểu khung vi thể",
      macro_small: "Di căn phúc mạc ngoài tiểu khung ≤ 2 cm",
      macro_large: "Di căn phúc mạc ngoài tiểu khung > 2 cm",
      retroperitoneal_nodes: "Chỉ có hạch sau phúc mạc",
    };

    const MMap = {
      M0: "Không có di căn xa",
      M1a: "Tràn dịch màng phổi có tế bào ác tính",
      M1b: "Di căn nhu mô hoặc cơ quan ngoài ổ bụng",
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
    <h2 style="text-align:center;">BÁO CÁO PHÂN LOẠI UNG THƯ BUỒNG TRỨNG (TNM/FIGO)</h2>

    <!-- T -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
      <caption><strong>1. Khối u nguyên phát (T)</strong></caption>

      <tr><td><strong>Buồng trứng bị ảnh hưởng</strong></td><td>${
        mapOvary[values.affected_ovary] || "Không rõ"
      }</td></tr>

      <tr><td><strong>Tình trạng khối u</strong></td><td>${
        tumourStatusMap[values.tumour_status] || "Không rõ"
      }</td></tr>

      <tr><td><strong>Dịch cổ trướng / rửa phúc mạc</strong></td><td>${
        ascitesMap[values.ascites_malignant_cells] || "Không rõ"
      }</td></tr>

      <tr><td><strong>Tổn thương ngoài tiểu khung</strong></td><td>${
        extrapelvicMap[values.extrapelvic_involvement] || "Không rõ"
      }</td></tr>

      <tr>
        <td><strong>Kết luận T</strong></td>
        <td><strong style="color:red;">${summary.T || ""}</strong></td>
      </tr>
    </table>

    <!-- N -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>2. Hạch vùng (N)</strong></caption>

      <tr><td><strong>Hạch vùng</strong></td><td>${yesNo(
        values.regional_nodes,
      )}</td></tr>

      <tr><td><strong>Kích thước di căn (mm)</strong></td><td>${
        values.meta_size ?? "Không rõ"
      }</td></tr>

      <tr>
        <td><strong>Kết luận N</strong></td>
        <td>${summary.N || ""}</td>
      </tr>
    </table>

    <!-- M -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>3. Di căn xa (M)</strong></caption>

      <tr><td><strong>Di căn xa</strong></td><td>${
        MMap[values.distant_metastases] || "Không rõ"
      }</td></tr>

      <tr>
        <td><strong>Kết luận M</strong></td>
        <td>${summary.M || ""}</td>
      </tr>
    </table>

    <!-- KẾT LUẬN -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>4. Kết luận</strong></caption>

      <tr><td><strong>Nhóm giai đoạn</strong></td><td>${summary.SG || ""}</td></tr>
      <tr><td><strong>FIGO</strong></td><td>${summary.FIGO || ""}</td></tr>
      <tr><td><strong>Phân loại đơn giản</strong></td><td>${summary.SimpG || ""}</td></tr>
      <tr><td><strong>Khoảng giai đoạn</strong></td><td>${summary.range || ""}</td></tr>
      <tr><td><strong>TNM</strong></td><td>${summary.TNM || ""}</td></tr>
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
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial; font-size:14px;">
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

Dưới đây là kết quả phân loại ung thư buồng trứng theo TNM:
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
          name={"TNM-Ovary"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư buồng chứng theo phiên bản TNM Edition 8"
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
                  name="affected_ovary"
                  label={
                    <LabelWithHint
                      text="Buồng trứng bị ảnh hưởng"
                      image="/product/cancer/ovary/T_side.png"
                    />
                  }
                >
                  <Radio.Group>
                    <Radio value="one">Chỉ một buồng trứng</Radio>
                    <Radio value="both">Cả hai buồng trứng</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ affected_ovary: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item
                  name="tumour_status"
                  label={
                    <LabelWithHint
                      text="Tình trạng khối u"
                      image="/product/cancer/ovary/T_status.png"
                    />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="intact">
                      Vỏ bao còn nguyên, không có u trên bề mặt buồng trứng hoặc
                      ống dẫn trứng
                    </Radio>

                    <Radio value="ruptured_surgery">
                      Vỡ vỏ bao trong phẫu thuật (tràn tế bào u)
                    </Radio>

                    <Radio value="ruptured_before">
                      Vỡ vỏ bao trước phẫu thuật hoặc có u trên bề mặt buồng
                      trứng/ống dẫn trứng
                    </Radio>

                    <Radio value="pelvic_implants">
                      Lan trong tiểu khung và/hoặc có cấy ghép trên tử cung, ống
                      dẫn trứng hoặc buồng trứng
                    </Radio>

                    <Radio value="pelvic_extension">
                      Lan đến các mô khác trong tiểu khung (bao gồm ruột trong
                      tiểu khung)
                    </Radio>

                    <Radio value="primary_peritoneal">
                      Ung thư phúc mạc nguyên phát
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ tumour_status: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item
                  name="ascites_malignant_cells"
                  label={
                    <LabelWithHint
                      text="Tế bào ác tính trong dịch cổ trướng hoặc dịch rửa phúc mạc"
                      image="/product/cancer/ovary/T_ascites.png"
                    />
                  }
                >
                  <Radio.Group>
                    <Radio value="no">
                      Không có tế bào ác tính trong dịch cổ trướng hoặc dịch rửa
                      phúc mạc
                    </Radio>
                    <Radio value="yes">
                      Có tế bào ác tính trong dịch cổ trướng hoặc dịch rửa phúc
                      mạc
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ ascites_malignant_cells: null });
                    setSummary((prev) => ({
                      ...prev,
                      T: getT(form.getFieldsValue()),
                    }));
                  }}
                >
                  Reset
                </Button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Form.Item
                  name="extrapelvic_involvement"
                  label={
                    <LabelWithHint
                      text="Tổn thương ngoài tiểu khung (bao gồm hạch sau phúc mạc)"
                      image="/product/cancer/ovary/T_extrapelvic.png"
                    />
                  }
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="none">
                      Không có tổn thương ngoài tiểu khung
                    </Radio>

                    <Radio value="microscopic">
                      Tổn thương phúc mạc ngoài tiểu khung vi thể
                    </Radio>

                    <Radio value="macro_small">
                      Di căn phúc mạc ngoài tiểu khung, kích thước ≤ 2 cm
                    </Radio>

                    <Radio value="macro_large">
                      Di căn phúc mạc ngoài tiểu khung, kích thước &gt; 2 cm
                    </Radio>

                    <Radio value="retroperitoneal_nodes">
                      Chỉ có hạch sau phúc mạc
                    </Radio>
                  </Radio.Group>
                </Form.Item>
                <Button
                  onClick={() => {
                    form.setFieldsValue({ extrapelvic_involvement: null });
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
                  name="regional_nodes"
                  label={
                    <LabelWithHint text="Hạch vùng (bao gồm hạch sau phúc mạc)" />
                  }
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="meta_size"
                  label={
                    <LabelWithHint text="Kích thước di căn hạch vùng (mm)" />
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
                  label={<LabelWithHint text="Di căn xa" />}
                >
                  <Radio.Group
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <Radio value="M0">Không có di căn xa</Radio>

                    <Radio value="M1a">
                      Tràn dịch màng phổi có tế bào ác tính
                    </Radio>

                    <Radio value="M1b">
                      Di căn nhu mô và/hoặc di căn đến các cơ quan ngoài ổ bụng
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
                FIGO:
              </strong>
              {summary.FIGO || ""}
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

export default OvarycancerForm;
