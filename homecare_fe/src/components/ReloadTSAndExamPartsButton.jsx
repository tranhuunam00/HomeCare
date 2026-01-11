import React, { useState } from "react";
import { Tooltip, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import useTemplateServicesAndExamParts from "../hooks/useTemplateServicesAndExamParts";

const ReloadTSAndExamPartsButton = ({ size = "middle" }) => {
  const { fetchTSAndExamParts } = useTemplateServicesAndExamParts();
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    try {
      setLoading(true);
      await fetchTSAndExamParts({ force: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Tải lại danh sách phân hệ và bộ phận">
      <Button
        type="text"
        icon={<ReloadOutlined spin={loading} />}
        loading={loading}
        onClick={handleReload}
        size={size}
      />
    </Tooltip>
  );
};

export default ReloadTSAndExamPartsButton;
