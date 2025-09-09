// LIRADSForm.jsx – Shell tối giản: chỉ chọn modality và mount sub-forms
import React, { useState } from "react";
import { Form, Button, Radio, Divider } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import styles from "./LIRADSForm.module.scss";

import CTMRIForm from "./CtMriForm";
import CEUSForm from "./CEUSForm";
import USSurveillanceForm from "./USSurveillanceForm";
import { ThamKhaoLinkHomeCare } from "../component_common/Thamkhao";

/* ====================== OPTIONS ====================== */
const MODALITY_OPTIONS = [
  { label: "CT/MRI", value: "ct_mri" },
  { label: "CEUS (Siêu âm tăng cường tương phản)", value: "ceus" },
  { label: "Siêu âm (theo dõi định kỳ)", value: "us_surv" },
];

const LIRADSForm = () => {
  const [form] = Form.useForm();
  const [modality, setModality] = useState(null);

  const onReset = () => {
    form.resetFields();
    setModality(null); // đổi key của sub-form => remount & reset toàn bộ state bên trong
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.formContainer}>
        <Form form={form} layout="vertical" onFinish={() => {}}>
          <ThamKhaoLinkHomeCare
            link={"https://home-care.vn/product/phan-mem-d-lirads/"}
          />
          <h2>Phần mềm D-LIRADS</h2>

          {/* Modality */}
          <Form.Item label="Chọn phương thức chẩn đoán hình ảnh:" required>
            <Radio.Group
              value={modality}
              onChange={(e) => setModality(e.target.value)}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MODALITY_OPTIONS.map((o) => (
                  <Radio key={o.value} value={o.value}>
                    {o.label}
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>

          {/* ===== Sub-forms ===== */}
          {modality === "ct_mri" && <CTMRIForm key="ct_mri" />}
          {modality === "ceus" && <CEUSForm key="ceus" />}
          {modality === "us_surv" && <USSurveillanceForm key="us_surv" />}

          <Divider />

          <div className={styles.buttonRow}>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Làm lại
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LIRADSForm;
