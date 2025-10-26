// FormActionBar.jsx
import React from "react";
import { Button, Tooltip } from "antd";
import {
  ReloadOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ExportOutlined,
  PrinterOutlined,
  LogoutOutlined,
  GatewayOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import styles from "./FormActionBar.module.scss";
import { useNavigate } from "react-router-dom";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import { getUsablePackageCodes } from "../../../constant/permission";
import { USER_ROLE } from "../../../constant/app";
import { toast } from "react-toastify";
import { APPROVAL_STATUS } from "../../../components/ApprovalStatusTag";

export const KEY_ACTION_BUTTON = {
  reset: "reset",
  save: "save",
  edit: "edit",
  approve: "approve",
  preview: "preview",
  export: "export",
  AI: "AI",
  print: "print",
  exit: "exit",
  translate: "translate",
};

export default function FormActionBar({
  onAction,
  onPrint,
  onReset,
  onPreview,
  onApprove,
  onGenAi,
  keys,
  onEdit,
  isEdit = false,
  editId,
  onTranslate = undefined,
  onExit = undefined,
  approvalStatus = APPROVAL_STATUS.DRAFT,
  languageTranslate,
}) {
  const navigate = useNavigate();
  const { userPackages, user } = useGlobalAuth();

  const availblePackage = getUsablePackageCodes(userPackages);

  const emptyF = () => {};
  const items = [
    {
      key: "reset",
      label: "RESET",
      icon: <ReloadOutlined />,
      onClick: onReset ?? emptyF,
      disabled: approvalStatus == APPROVAL_STATUS.APPROVED,
    },
    {
      key: "save",
      label: "SAVE",
      icon: <SaveOutlined />,
      disabled:
        (editId && !isEdit) || approvalStatus == APPROVAL_STATUS.APPROVED,
    },
    {
      key: "edit",
      label: "EDIT",
      icon: <EditOutlined />,
      onClick: onEdit,
      disabled: !editId || approvalStatus == APPROVAL_STATUS.APPROVED,
    },
    {
      key: "approve",
      label: "APPROVE",
      icon: <CheckCircleOutlined />,
      onClick: onApprove ?? emptyF,
      disabled: !editId || approvalStatus == APPROVAL_STATUS.APPROVED,
    },
    {
      key: "preview",
      label: "PREVIEW",
      icon: <EyeOutlined />,
      onClick: onPreview ?? emptyF,
      disabled: !editId,
    },
    {
      key: "export",
      label: "EXPORT",
      icon: <ExportOutlined />,
      onClick: onPrint ?? emptyF,
      disabled: !editId,
    },
    {
      key: "AI",
      label: "AI GEN",
      icon: <GatewayOutlined />,
      onClick: onGenAi || emptyF,
      disabled: approvalStatus == APPROVAL_STATUS.APPROVED,
    },

    {
      key: "print",
      label: "IN",
      icon: <PrinterOutlined />,
      onClick: onPrint || emptyF,
      disabled: approvalStatus != APPROVAL_STATUS.APPROVED,
    },

    {
      key: "translate",
      label: "DỊCH KHÁC",
      icon: <TranslationOutlined />,
      onClick: () => {
        toast.info("Sắp ra mắt tính năng dịch đa ngôn ngữ!");
      },
      // onClick: onViewTranslate || emptyF,
      disabled:
        !availblePackage.includes("PREMIUM") && user.id_role != USER_ROLE.ADMIN,
    },

    {
      key: "translate",
      label: "DỊCH ENGLISH",
      icon: <TranslationOutlined />,
      onClick: onTranslate || emptyF,
      disabled:
        !editId ||
        languageTranslate != "vi" ||
        (!availblePackage.includes("PREMIUM") &&
          user.id_role != USER_ROLE.ADMIN),
    },
    {
      key: "exit",
      label: "EXIT",
      icon: <LogoutOutlined />,
      onClick: () => {
        if (onExit) {
          onExit();
        } else {
          navigate(-1);
        }
      },
    },
  ];

  const genButtonC = (it) => {
    const disabledReason = (() => {
      if (it.key === "save" && approvalStatus == APPROVAL_STATUS.APPROVED)
        return "Không thể lưu vì mẫu đã được phê duyệt";
      if (it.key === "edit" && approvalStatus == APPROVAL_STATUS.APPROVED)
        return "Không thể chỉnh sửa mẫu đã được phê duyệt";
      if (it.key === "print" && approvalStatus !== APPROVAL_STATUS.APPROVED)
        return "Chỉ in được khi mẫu đã được phê duyệt";
      if (it.key === "translate" && !availblePackage.includes("PREMIUM"))
        return "Chức năng dịch chỉ khả dụng cho gói PREMIUM";
      if (it.disabled) return "Chức năng hiện không khả dụng";
      return null;
    })();

    const btn = (
      <Button
        key={it.key}
        className={`${styles.btn} ${styles[it.key]}`}
        icon={it.icon}
        block
        onClick={() => (it.onClick ? it.onClick() : onAction?.(it.key))}
        disabled={it.disabled}
      >
        {it.label}
      </Button>
    );

    // 🧩 Tooltip chỉ bọc nếu có disabledReason
    return disabledReason ? (
      <Tooltip title={disabledReason} placement="top">
        <span style={{ display: "block" }}>{btn}</span>
      </Tooltip>
    ) : (
      btn
    );
  };
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionGrid}>
        {!keys?.length
          ? items.map((it) => genButtonC(it))
          : items
              .filter((i) => keys.includes(i.key))
              .map((it) => genButtonC(it))}
      </div>
    </div>
  );
}
