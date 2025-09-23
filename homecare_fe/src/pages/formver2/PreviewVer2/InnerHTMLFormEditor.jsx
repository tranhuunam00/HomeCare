import React from "react";
import { replaceInputsInHtml } from "../../patient/Use/PatientUseTemplate";

const InnerHTMLFormEditor = ({ data }) => {
  return (
    <div>
      <style>
        {`
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #ccc; padding: 2px; text-align: left; }
          h3 { margin-bottom: 20px; margin-top: 40px; }
          p { font-size: 14px; }

          ul { margin: 0 0 2px 15px; padding: 0; list-style-type: disc; }
          ul ul { list-style-type: circle; margin-left: 20px; }
          ul ul ul { list-style-type: square; margin-left: 20px; }

          li { display: list-item; font-size: 14px; margin-bottom: 4px; }
        `}
      </style>

      <div
        dangerouslySetInnerHTML={{
          __html: replaceInputsInHtml(data || "", []),
        }}
      />
    </div>
  );
};

export default InnerHTMLFormEditor;
