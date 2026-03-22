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

  const onReset = () => {
    form.resetFields();
    setSummary({ T: "", N: "", M: "", stage: "" });
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

  const genHtml = () => {
    return `
      <table>
        <caption>Phân loại TNM Phổi</caption>
        <tr><th>Thành phần</th><th>Giá trị</th></tr>
        <tr><td>T (Tumor)</td><td>${summary.T}</td></tr>
        <tr><td>N (Node)</td><td>${summary.N}</td></tr>
        <tr><td>M (Metastasis)</td><td>${summary.M}</td></tr>
        <tr><td><strong>Stage</strong></td><td><strong>${summary.stage}</strong></td></tr>
      </table>
    `;
  };

  const onCopy = async () => {
    try {
      const html = genHtml();

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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <ThamKhaoLinkHomeCare
          link={"https://home-care.vn/product/phan-mem-d-lungrads/"}
          name={"D-LungRADS"}
          desc={
            "Đánh giá nguy cơ ung thư phổi dựa trên đặc điểm nốt phổi theo hệ thống Lung-RADS"
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

          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
            <Button onClick={onCalculate}>Kết quả</Button>
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
