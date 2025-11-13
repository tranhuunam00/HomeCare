import React, { useState } from "react";
import { Button, Tooltip, Modal, Select } from "antd";
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
import {
  getUsablePackageCodes,
  hasProOrBusiness,
} from "../../../constant/permission";
import { USER_ROLE } from "../../../constant/app";
import { toast } from "react-toastify";
import { APPROVAL_STATUS } from "../../../components/ApprovalStatusTag";
import { LANGUAGE_OPTIONS } from "../../doctor_use_form_ver2/use/DoctorIUseFormVer2";

const { Option } = Select;

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
  translate_multi: "translate_multi",
  translate_en: "translate_en",
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
  onTranslateMulti = undefined,
  onExit = undefined,
  approvalStatus = APPROVAL_STATUS.DRAFT,
  languageTranslate,
}) {
  const navigate = useNavigate();
  const { userPackages, user } = useGlobalAuth();

  const availblePackage = getUsablePackageCodes(userPackages);

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);

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
      disabled:
        approvalStatus == APPROVAL_STATUS.APPROVED ||
        (!availblePackage.includes("BUSINESS") &&
          user.id_role != USER_ROLE.ADMIN),
    },
    {
      key: "print",
      label: "IN",
      icon: <PrinterOutlined />,
      onClick: onPrint || emptyF,
      disabled: approvalStatus != APPROVAL_STATUS.APPROVED,
    },
    {
      key: "translate_multi",
      label: "DỊCH KHÁC",
      icon: <TranslationOutlined />,
      onClick: () => setLangModalOpen(true), // ✅ mở popup chọn ngôn ngữ
      disabled:
        !editId ||
        (!availblePackage.includes("BUSINESS") &&
          user.id_role != USER_ROLE.ADMIN),
    },
    {
      key: "translate_en",
      label: "DỊCH ENGLISH",
      icon: <TranslationOutlined />,
      onClick: onTranslate || emptyF,
      disabled:
        !editId ||
        languageTranslate != "vi" ||
        (!hasProOrBusiness(userPackages) && user.id_role != USER_ROLE.ADMIN),
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
      if (it.key === "translate_multi" && !availblePackage.includes("BUSINESS"))
        return "Chức năng dịch đa ngôn ngữ chỉ khả dụng cho gói BUSINESS";
      if (
        it.key === KEY_ACTION_BUTTON.AI &&
        !availblePackage.includes("BUSINESS")
      )
        return "Chức năng AI đề xuất chỉ khả dụng cho gói BUSINESS";
      if (it.key === "translate_en" && !hasProOrBusiness(userPackages))
        return "Chức năng dịch chỉ khả dụng cho gói PRO và BUSINESS";
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

    return disabledReason ? (
      <Tooltip title={disabledReason} placement="top">
        <span style={{ display: "block" }}>{btn}</span>
      </Tooltip>
    ) : (
      btn
    );
  };

  return (
    <>
      {/* 🔹 Modal chọn ngôn ngữ dịch */}
      <Modal
        title="Chọn ngôn ngữ cần dịch"
        open={langModalOpen}
        onCancel={() => setLangModalOpen(false)}
        onOk={() => {
          if (!selectedLang) {
            toast.warn("Vui lòng chọn ngôn ngữ cần dịch!");
            return;
          }
          setLangModalOpen(false);

          onTranslateMulti?.({
            targetLang: selectedLang,
            sourceLang: languageTranslate,
          });
        }}
        okText="Dịch"
        cancelText="Hủy"
      >
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Chọn ngôn ngữ đích"
          value={selectedLang}
          onChange={(v) => setSelectedLang(v)}
          optionFilterProp="children"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <Option
              key={opt.value}
              value={opt.value}
              disabled={languageTranslate == opt.value}
            >
              {opt.label}
            </Option>
          ))}
        </Select>
      </Modal>

      <div className={styles.actionBar}>
        <div className={styles.actionGrid}>
          {!keys?.length
            ? items.map((it) => genButtonC(it))
            : items
                .filter((i) => keys.includes(i.key))
                .map((it) => genButtonC(it))}
        </div>
      </div>
    </>
  );
}
