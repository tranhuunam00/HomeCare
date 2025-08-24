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
          p {font-size: 14px}
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
