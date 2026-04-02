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
import styles from "./ProstatecancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Prostatecancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const ProstatecancerForm = () => {
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

Dưới đây là kết quả phân loại ung thư tuyến tiền liệt theo TNM:
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
          name={"TNM-Prostate"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư tuyến tiền liệt theo phiên bản TNM Edition 8"
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
                  name="appearance"
                  label={<LabelWithHint text="Biểu hiện lâm sàng của khối u" />}
                >
                  <Radio.Group>
                    <Radio value="no">
                      Không biểu hiện lâm sàng (không sờ thấy hoặc không thấy
                      trên hình ảnh)
                    </Radio>
                    <Radio value="yes">Có biểu hiện lâm sàng</Radio>
                  </Radio.Group>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ appearance: null });
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
                  name="extension"
                  label={
                    <LabelWithHint
                      text="Mức độ lan rộng của khối u (Extension)"
                      image="/product/cancer/prostate/T_extension.png"
                    />
                  }
                >
                  <Select placeholder="Vui lòng chọn">
                    <Select.Option value="1">
                      Phát hiện tình cờ qua mô học ≤ 5% mô cắt bỏ
                    </Select.Option>

                    <Select.Option value="2">
                      {`Phát hiện tình cờ qua mô học > 5% mô cắt bỏ`}
                    </Select.Option>

                    <Select.Option value="3">
                      Phát hiện qua sinh thiết kim
                    </Select.Option>

                    <Select.Option value="4">
                      Khối u chiếm ≤ 1/2 một thùy (phát hiện lâm sàng)
                    </Select.Option>

                    <Select.Option value="5">
                      {`Khối u chiếm > 1/2 một thùy (phát hiện lâm sàng)`}
                    </Select.Option>

                    <Select.Option value="6">
                      Khối u ở cả hai thùy (phát hiện lâm sàng)
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Button
                  onClick={() => {
                    form.setFieldsValue({ extension: null });
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
                name="capsule_extension"
                label={
                  <LabelWithHint
                    text="Khối u lan xuyên qua bao tuyến tiền liệt"
                    image="/product/cancer/prostate/T_capsule.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="bladder_neck_invasion"
                label={
                  <LabelWithHint text="Khối u xâm lấn cổ bàng quang (vi thể)" />
                }
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="seminal_vesicles_invasion"
                label={
                  <LabelWithHint
                    text="Khối u xâm lấn túi tinh"
                    image="/product/cancer/prostate/T_vescicles.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="bladder_invasion"
                label={
                  <LabelWithHint
                    text="Khối u xâm lấn bàng quang"
                    image="/product/cancer/prostate/T_bladder.png"
                  />
                }
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="external_sphincter_invasion"
                label={<LabelWithHint text="Khối u xâm lấn cơ thắt ngoài" />}
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="rectum_or_levator_invasion"
                label={
                  <LabelWithHint text="Khối u xâm lấn trực tràng hoặc cơ nâng hậu môn" />
                }
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="pelvic_wall_invasion"
                label={<LabelWithHint text="Khối u xâm lấn thành chậu" />}
              >
                <Radio.Group>
                  <Radio value="yes">Có</Radio>
                  <Radio value="no">Không</Radio>
                  <Radio value="unknown">Không rõ</Radio>
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
                      text="Số lượng hạch dương tính trong khu vực"
                      image="/product/cancer/prostate/N_positiven.png"
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
                  name="non_regional_nodes_metastases"
                  label={<LabelWithHint text="Di căn đến hạch không vùng" />}
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="bone_metastases"
                  label={<LabelWithHint text="Di căn xương" />}
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="other_sites_metastases"
                  label={<LabelWithHint text="Di căn đến các vị trí khác" />}
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
                </Form.Item>
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

export default ProstatecancerForm;
