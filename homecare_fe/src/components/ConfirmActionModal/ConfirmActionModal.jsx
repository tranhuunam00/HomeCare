import React from "react";
import { Modal, Spin, Typography } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

/**
 * ConfirmActionModal – Modal xác nhận dùng chung toàn hệ thống.
 *
 * Kết hợp với hook `useConfirmAction` để bọc bất kỳ tác vụ async nào.
 * Tự động hiện spinner trong nút OK khi đang xử lý.
 *
 * Props được cung cấp tự động từ `confirmState` của `useConfirmAction`.
 *
 * @example
 * const { confirmState, openConfirm } = useConfirmAction();
 *
 * // Trong JSX (đặt một lần ở gần root component):
 * <ConfirmActionModal {...confirmState} />
 *
 * // Trigger:
 * openConfirm({ title: "...", message: "...", onConfirm: asyncFn });
 */
export default function ConfirmActionModal({
  open = false,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này không?",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleFilled style={{ color: "#faad14", fontSize: 20 }} />
          <span>{title}</span>
        </span>
      }
      onOk={onConfirm}
      onCancel={!loading ? onCancel : undefined}
      okText={
        loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Spin size="small" />
            Đang xử lý...
          </span>
        ) : (
          "Xác nhận"
        )
      }
      cancelText="Hủy"
      okButtonProps={{ loading, disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
      closable={!loading}
      maskClosable={!loading}
      centered
      width={440}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 12,
          marginBottom: 16,
        },
        body: { padding: "8px 0 4px" },
      }}
    >
      <Text style={{ fontSize: 14, lineHeight: "1.6" }}>{message}</Text>
    </Modal>
  );
}
