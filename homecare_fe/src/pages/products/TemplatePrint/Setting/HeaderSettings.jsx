import { Modal, Button } from "antd";
import HeaderCanvas from "./HeaderCanvas";

const HeaderSettings = ({ open, onClose, headerInfo }) => {
  return (
    <Modal
      open={open}
      width={900}
      title="Cài đặt header mẫu in"
      footer={null}
      onCancel={onClose}
      destroyOnClose
      headerInfo={headerInfo}
    >
      <HeaderCanvas headerInfo={headerInfo} />
    </Modal>
  );
};

export default HeaderSettings;
