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
        <h2>Chọn gói sử dụng phần mềm D-RADS phù hợp</h2>
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
        title={<span className={styles.modalTitle}>Xác nhận đăng ký gói</span>}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setShowQR(false);
        }}
        footer={null}
        className={styles.subscriptionModal}
      >
        <p className={styles.selectedPlanLabel}>
          Bạn đang chọn gói:{" "}
          <strong className={styles.planName}>{selectedPackage}</strong>
        </p>

        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Chu kỳ thanh toán</label>
          <Select
            className={styles.selectField}
            value={duration}
            onChange={(val) => {
              setDuration(val);
              setShowQR(false);
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
                    <span className={styles.savingTag}>
                      (Tiết kiệm {feeItem.saving.toLocaleString("vi-VN")} đ)
                    </span>
                  )}
                </Option>
              );
            })}
          </Select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Ghi chú (tùy chọn)</label>
          <Input.TextArea
            className={styles.textAreaField}
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
            className={styles.btnProceed}
            onClick={() => setShowQR(true)}
          >
            Tiến hành thanh toán
          </Button>
        )}

        {/* QR tự động từ PACKAGE_FEES */}
        {showQR && qrImage && (
          <div className={styles.qrContainer}>
            <img
              src={qrImage}
              alt="QR Payment"
              className={styles.qrImage}
            />
            <p className={styles.qrTip}>
              Vui lòng quét mã và thanh toán trước khi gửi yêu cầu
            </p>
          </div>
        )}

        {/* Nút gửi yêu cầu */}
        <Button
          type="primary"
          block
          className={styles.btnConfirm}
          loading={loading}
          disabled={hasQR && !showQR}
          onClick={handleSubmit}
        >
          Xác nhận thanh toán
        </Button>
      </Modal>
    </div>
  );
};

export default PackageList;
