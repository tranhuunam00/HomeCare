import React from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "./CustomSunEditor.scss";
import storage from "../../services/storage";

const apiEndPoint = `${
  import.meta.env.VITE_API_ENDPOINT || "http://localhost:3001/api/"
}/api`;

const CustomSunEditor = ({ value, onChange, className }) => {
  const token = storage.get("TOKEN");

  return (
    <div className={`editor-container ${className}`}>
      <SunEditor
        height="300"
        setContents={value}
        onChange={onChange}
        onImageUploadBefore={(files, info, uploadHandler) => {
          const formData = new FormData();
          formData.append("fileUpload", files[0]);

          fetch(`${apiEndPoint}/upload`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((res) => res.json())
            .then((res) => {
              const imageUrl = res?.fileUrl || res?.data?.result?.url;
              if (!imageUrl) throw new Error("Không nhận được đường dẫn ảnh");

              uploadHandler({
                result: [
                  {
                    url: imageUrl,
                    name: info.name,
                    size: info.size,
                  },
                ],
              });
            })
            .catch((err) => {
              console.error("Upload thất bại:", err);
              uploadHandler(err.toString());
            });

          return false; // ngăn SunEditor upload mặc định
        }}
        setOptions={{
          height: "300px",
          defaultStyle: "line-height: 1.4; font-size: 14px;",
          buttonList: [
            ["undo", "redo"],
            ["formatBlock", "font", "fontSize"],
            [
              "bold",
              "underline",
              "italic",
              "strike",
              "subscript",
              "superscript",
            ],
            ["fontColor", "hiliteColor", "textStyle"],
            ["removeFormat"],
            ["align", "horizontalRule", "list", "table"],
            ["link", "image", "video"],
            ["fullScreen", "showBlocks", "codeView"],
          ],
          resizingBar: true,
          imageResize: true,
          imageFileInput: true,
          videoFileInput: true,
        }}
      />
    </div>
  );
};

export default CustomSunEditor;
