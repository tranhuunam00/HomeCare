import { Modal, Button } from "antd";
import HeaderCanvas from "./HeaderCanvas";

const HeaderSettings = ({ open, onClose, headerBlocks, onChange }) => {
  console.log("headerBlocks", headerBlocks);
  return (
    <Modal
      open={open}
      width={900}
      title="Cài đặt header mẫu in"
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <HeaderCanvas blocks={headerBlocks} onChange={onChange} />

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button type="primary" onClick={onClose}>
          Lưu
        </Button>
      </div>
    </Modal>
  );
};

export default HeaderSettings;
