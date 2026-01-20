// HeaderCanvas/editors/EditorPanel.jsx
import TextEditor from "./TextEditor";
import ImageEditor from "./ImageEditor";

const EditorPanel = ({ block, onChange }) => {
  if (!block) {
    return <div>Chọn 1 thành phần để chỉnh sửa</div>;
  }

  if (block.type === "text") {
    return <TextEditor block={block} onChange={onChange} />;
  }

  if (block.type === "image") {
    return <ImageEditor block={block} onChange={onChange} />;
  }

  return null;
};

export default EditorPanel;
