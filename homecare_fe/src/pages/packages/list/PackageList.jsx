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

const PackageList = ({ isLanding = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [duration, setDuration] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const fees = PACKAGE_FEES[selectedPackage];
  const [showQR, setShowQR] = useState(false);

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

  const selectedFeeItem = PACKAGE_FEES[selectedPackage]?.find(
    (f) => f.value === duration
  );

  const qrImage = selectedFeeItem?.qr
    ? `/payment/${selectedFeeItem.qr}` // ví dụ: public/qr/650k.jpg
    : null;

  const hasQR = !!qrImage;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Chọn gói dịch vụ DRADS phù hợp với bạn</h2>
      </div>

      <Row gutter={[24, 24]} justify="center" className={styles.wrapper_cards}>
        {Object.entries(PACKAGE_FEATURES).map(([key, plan]) => (
          <Col xs={24} sm={12} md={8} key={key}>
            <PackageCard
              planKey={key}
              plan={plan}
              onSelect={handleSelect}
              isLanding={isLanding}
            />
          </Col>
        ))}
      </Row>

      <Modal
        title="Xác nhận đăng ký gói"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setShowQR(false);
        }}
        footer={null}
      >
        <p>
          Bạn đang chọn gói:{" "}
          <strong style={{ color: "#1677ff" }}>{selectedPackage}</strong>
        </p>

        <div style={{ marginTop: 12 }}>
          <label>Chu kỳ thanh toán</label>
          <Select
            style={{ width: "100%", marginTop: 4 }}
            value={duration}
            onChange={(val) => {
              setDuration(val);
              setShowQR(false); // đổi duration thì ẩn QR, disable lại nút
            }}
          >
            {DURATION_OPTIONS.map((d) => {
              const feeItem = PACKAGE_FEES[selectedPackage]?.find(
                (f) => f.value === d.value
              );

              return (
                <Option key={d.value} value={d.value}>
                  {`${d.label} – ${feeItem?.label} đ`}
                  {feeItem?.saving > 0 && (
                    <span style={{ color: "#52c41a", marginLeft: 6 }}>
                      (Tiết kiệm {feeItem.saving.toLocaleString("vi-VN")} đ)
                    </span>
                  )}
                </Option>
              );
            })}
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

        {/* Tiến hành thanh toán */}
        {hasQR && (
          <Button
            type="default"
            block
            style={{ marginTop: 16 }}
            onClick={() => setShowQR(true)}
          >
            Tiến hành thanh toán
          </Button>
        )}

        {/* QR tự động từ PACKAGE_FEES */}
        {showQR && qrImage && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <img
              src={qrImage}
              alt="QR Payment"
              style={{ width: 200, borderRadius: 8 }}
            />
            <p style={{ marginTop: 8, color: "#888" }}>
              Vui lòng quét mã và thanh toán trước khi gửi yêu cầu
            </p>
          </div>
        )}

        {/* Nút gửi yêu cầu */}
        <Button
          type="primary"
          block
          style={{ marginTop: 16 }}
          loading={loading}
          disabled={hasQR && !showQR} // chỉ bật sau khi bấm “Tiến hành thanh toán”
          onClick={handleSubmit}
        >
          Xác nhận thanh toán
        </Button>
      </Modal>
    </div>
  );
};

export default PackageList;
