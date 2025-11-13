import React, { useState } from "react";
import { Row, Col, Modal, Select, Input, Button } from "antd";
import { toast } from "react-toastify";
import styles from "./PackageList.module.scss";
import PackageCard from "../components/card/PackageCard";
import API_CALL from "../../../services/axiosClient";
import {
  DURATION_OPTIONS,
  PACKAGE_FEATURES,
  PACKAGE_FEES,
} from "../../../constant/permission";

const { Option } = Select;

const PackageList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const fees = PACKAGE_FEES[selectedPackage];

  const handleSelect = (planKey) => {
    setSelectedPackage(planKey);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedPackage) return toast.error("Vui lòng chọn gói!");
    setLoading(true);
    try {
      await API_CALL.post("/package/request", {
        package_code: selectedPackage,
        duration_months: duration,
        type: "new",
        note,
      });
      toast.success("Gửi yêu cầu đăng ký gói thành công!");
      setModalVisible(false);
      setNote("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Đăng ký gói thất bại, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Chọn gói dịch vụ DRADS phù hợp với bạn</h2>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {Object.entries(PACKAGE_FEATURES).map(([key, plan]) => (
          <Col xs={24} sm={12} md={8} key={key}>
            <PackageCard planKey={key} plan={plan} onSelect={handleSelect} />
          </Col>
        ))}
      </Row>

      <Modal
        title="Xác nhận đăng ký gói"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <p>
          Bạn đang chọn gói:{" "}
          <strong style={{ color: "#1677ff" }}>{selectedPackage}</strong>
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Thời hạn sử dụng</label>
          <Select
            style={{ width: "100%", marginTop: 4 }}
            value={duration}
            onChange={(val) => setDuration(val)}
          >
            {DURATION_OPTIONS.map((d) => (
              <Option key={d.value} value={d.value} disabled={d.value !== 1}>
                {d.label}
              </Option>
            ))}
          </Select>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Ghi chú (tùy chọn)</label>
          <Input.TextArea
            rows={3}
            placeholder="Nhập ghi chú ... "
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div>
          {fees?.map((f) => (
            <div key={f.value}>
              <span>{f.value} tháng: </span>
              <strong>{f.label} đ</strong>
            </div>
          ))}
        </div>
        <Button
          type="primary"
          block
          style={{ marginTop: 16 }}
          loading={loading}
          onClick={handleSubmit}
        >
          Gửi yêu cầu đăng ký
        </Button>
      </Modal>
    </div>
  );
};

export default PackageList;
