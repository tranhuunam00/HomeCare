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
import styles from "./CervixcancerForm.module.scss";
import { toast } from "react-toastify";

import {
  getN,
  getStage,
  getT,
  M_OPTIONS,
  N_OPTIONS,
  T_OPTIONS,
} from "./Cervixcancer.Constants";
import LabelWithHint from "../component/LabelWithHint";
import { ThamKhaoLinkHomeCare } from "../../component_common/Thamkhao";
import AIRecommendationEditor from "../../../../components/AIRecommendationEditor";
import API_CALL from "../../../../services/axiosClient";

const { Text } = Typography;

const CervixcancerForm = () => {
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

    const MMap = {
      M0: "Không có di căn xa",
      M1: "Có di căn xa",
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
    <h2 style="text-align:center;">
      BÁO CÁO PHÂN LOẠI UNG THƯ CỔ TỬ CUNG (TNM/FIGO)
    </h2>

    <!-- T -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:10px;">
      <caption><strong>1. Khối u nguyên phát (T)</strong></caption>

      <tr><td><strong>Tổn thương vi mô</strong></td><td>${yesNo(values.micro_only)}</td></tr>

      <tr><td><strong>Xâm lấn mô đệm</strong></td><td>${values.stromal || "Không rõ"}</td></tr>

      <tr><td><strong>Tổn thương thấy trên lâm sàng</strong></td><td>${values.clinically_visible_lesion || "Không rõ"}</td></tr>

      <tr><td><strong>Lan ra ngoài tử cung</strong></td><td>${yesNo(values.beyond_uterus)}</td></tr>

      <tr><td><strong>Xâm lấn parametrium</strong></td><td>${yesNo(values.parametrial_involvement)}</td></tr>

      <tr><td><strong>Xâm lấn 1/3 dưới âm đạo</strong></td><td>${yesNo(values.lower_vagina)}</td></tr>

      <tr><td><strong>Lan đến thành chậu</strong></td><td>${yesNo(values.pelvic_wall)}</td></tr>

      <tr><td><strong>Ứ nước thận</strong></td><td>${yesNo(values.hydronephrosis)}</td></tr>

      <tr><td><strong>Xâm lấn bàng quang/trực tràng</strong></td><td>${yesNo(values.bladder_rectum)}</td></tr>

      <tr>
        <td><strong>Kết luận T</strong></td>
        <td><strong style="color:red;">${summary.T || ""}</strong></td>
      </tr>
    </table>

    <!-- N -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>2. Hạch vùng (N)</strong></caption>

      <tr><td><strong>Số lượng hạch dương tính</strong></td><td>${values.pos_num ?? "Không rõ"}</td></tr>

      <tr>
        <td><strong>Kết luận N</strong></td>
        <td>${summary.N || ""}</td>
      </tr>
    </table>

    <!-- M -->
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%; margin-top:16px;">
      <caption><strong>3. Di căn xa (M)</strong></caption>

      <tr><td><strong>Di căn xa</strong></td><td>${MMap[values.distant_metastases] || "Không rõ"}</td></tr>

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

Dưới đây là kết quả phân loại ung thư cổ tử cung theo TNM:
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
          name={"TNM-Cervix"}
          desc={
            "Hệ thống phân loại giai đoạn ung thư cổ tử cung theo phiên bản TNM Edition 8"
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
            <div style={{ flex: 2 }}>
              <div className={styles.sectionBlockT}>
                <div className={styles.sectionHeaderT}>
                  T – Khối u nguyên phát (Tumor)
                </div>
                <Form.Item
                  name="micro_only"
                  label={<LabelWithHint text="Chỉ có tổn thương vi mô" />}
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Chưa xác định</Radio>
                  </Radio.Group>
                </Form.Item>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Form.Item
                    name="stromal"
                    label={
                      <LabelWithHint
                        text="Mức độ xâm lấn mô đệm"
                        image="/product/cancer/cervix/T_stromal.png"
                      />
                    }
                  >
                    <Radio.Group
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Radio value="micro_1">
                        {`≤ 3 mm chiều sâu và ≤ 7 mm chiều ngang`}
                      </Radio>

                      <Radio value="micro_2">
                        {`> 3 mm đến ≤ 5 mm chiều sâu và ≤ 7 mm chiều ngang`}
                      </Radio>

                      <Radio value="macro">
                        {`> 5 mm chiều sâu hoặc > 7 mm chiều ngang`}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Button
                    onClick={() => {
                      form.setFieldsValue({ stromal: null });
                      setSummary((prev) => ({
                        ...prev,
                        T: getT(form.getFieldsValue()),
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
                    name="clinically_visible_lesion"
                    label={
                      <LabelWithHint
                        text="Tổn thương quan sát được trên lâm sàng"
                        image="/product/cancer/cervix/T_extendedvisible.png"
                      />
                    }
                  >
                    <Radio.Group
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Radio value="no">Không có tổn thương nhìn thấy</Radio>

                      <Radio value="le_4cm">Có, kích thước ≤ 4 cm</Radio>

                      <Radio value="gt_4cm">{`Có, kích thước > 4 cm`}</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Button
                    onClick={() => {
                      form.setFieldsValue({ clinically_visible_lesion: null });
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
                  name="beyond_uterus"
                  label={
                    <LabelWithHint
                      text="Khối u lan ra ngoài tử cung"
                      image="/product/cancer/cervix/T_beyonduterus.png"
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
                  name="parametrial_involvement"
                  label={
                    <LabelWithHint
                      text="Xâm lấn mô cạnh tử cung (parametrium)"
                      image="/product/cancer/cervix/T_parametrium.png"
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
                  name="lower_vagina"
                  label={
                    <LabelWithHint
                      text="Ung thư xâm lấn 1/3 dưới âm đạo"
                      image="/product/cancer/cervix/T_vagina.png"
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
                  name="pelvic_wall"
                  label={
                    <LabelWithHint
                      text="Lan đến thành chậu"
                      image="/product/cancer/cervix/T_pelvis.png"
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
                  name="hydronephrosis"
                  label={
                    <LabelWithHint text="Ứ nước thận hoặc thận không hoạt động" />
                  }
                >
                  <Radio.Group>
                    <Radio value="yes">Có</Radio>
                    <Radio value="no">Không</Radio>
                    <Radio value="unknown">Không rõ</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="bladder_rectum"
                  label={
                    <LabelWithHint
                      text="Khối u xâm lấn niêm mạc bàng quang hoặc trực tràng và/hoặc lan ra ngoài tiểu khung"
                      image="/product/cancer/cervix/T_mucosa.png"
                    />
                  }
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
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.sectionBlockN}>
                <div className={styles.sectionHeaderN}>
                  N – Hạch vùng (Node)
                </div>

                <Form.Item
                  name="pos_num"
                  label={<LabelWithHint text="Số lượng hạch dương tính (mm)" />}
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

export default CervixcancerForm;
