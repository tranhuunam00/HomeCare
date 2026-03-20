import React, { useState } from "react";
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
    N: "",
    M: "",
    stage: "",
  });

  const onReset = () => {
    form.resetFields();
    setSummary({ T: "", N: "", M: "", stage: "" });
  };

  const onCalculate = async () => {
    try {
      const values = await form.validateFields();
      const stage = getStage(values.T, values.N, values.M);

      setSummary({
        ...values,
        stage,
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
        <Form form={form} layout="vertical">
          <Form.Item
            name="mia"
            label={
              <LabelWithHint
                text="Ung thư biểu mô tuyến xâm lấn tối thiểu"
                note="Ung thư biểu mô tuyến xâm lấn tối thiểu:
Khối u đơn độc ≤ 3 cm, kiểu phát triển lepidic chiếm ưu thế, với phần xâm lấn ≤ 5 mm."
              />
            }
            rules={[{ required: true }]}
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
          <Form.Item
            name="bronchial_inv"
            label="Xâm lấn phế quản"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value={0}>Không xâm lấn phế quản chính</Radio>
              <Radio value={1}>Xâm lấn phế quản chính</Radio>
              <Radio value={2}>Xâm lấn carina hoặc khí quản</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="pleura_visceral"
            label="Xâm lấn màng phổi tạng"
            rules={[{ required: true }]}
          >
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
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
            style={{ marginBottom: 0 }}
          >
            <Radio.Group style={{ marginBottom: 0 }}>
              <Radio value={1}>Có</Radio>
              <Radio value={0}>Không</Radio>
              <Radio value={-1}>Không rõ</Radio>
            </Radio.Group>
          </Form.Item>
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
