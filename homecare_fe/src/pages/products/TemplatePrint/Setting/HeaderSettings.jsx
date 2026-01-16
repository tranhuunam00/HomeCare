import { Modal, Button } from "antd";
import HeaderCanvas from "./HeaderCanvas";

const HeaderSettings = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      width={900}
      title="Cài đặt header mẫu in"
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <HeaderCanvas />
    </Modal>
  );
};

export default HeaderSettings;
