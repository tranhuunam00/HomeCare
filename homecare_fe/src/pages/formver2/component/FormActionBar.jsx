import React, { useEffect, useState } from "react";
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
  SignatureOutlined,
  DeleteRowOutlined,
  DeleteOutlined,
  DotNetOutlined,
  FileDoneOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import styles from "./FormActionBar.module.scss";
import { useNavigate } from "react-router-dom";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import {
  getUsablePackageCodes,
  hasProOrBusiness,
} from "../../../constant/permission";
import { PATIENT_DIAGNOSE_STATUS_CODE, USER_ROLE } from "../../../constant/app";
import { toast } from "react-toastify";
import { APPROVAL_STATUS } from "../../../components/ApprovalStatusTag";
import { LANGUAGE_OPTIONS } from "../../doctor_use_form_ver2/use/DoctorIUseFormVer2";

const { Option } = Select;

export const KEY_ACTION_BUTTON = {
  reset: "reset",
  save: "save",
  edit: "edit doc",
  doc_xong: "doc_xong",
  huy_doc: "huy_doc",
  huy_duyet: "huy_duyet",
  nhan_duyet: "nhan_duyet",
  edit_duyet: "edit_duyet",
  save_duyet: "save_duyet",
  duyet: "approve",
  preview: "preview",
  export: "export",
  AI: "AI",
  print: "print",
  exit: "exit",
  translate_multi: "translate_multi",
  translate_en: "translate_en",
  sign: "sign",
  verifySign: "verifySign",
};

export default function FormActionBar({
  onAction,
  onPrint,
  onReset,
  onPreview,
  onApprove,
  onGenAi,
  actionKeys,
  onEdit,
  isEdit = false,
  editId,
  onTranslate = undefined,
  onTranslateMulti = undefined,
  onExit = undefined,
  languageTranslate,
  onSign,
  patientDiagnose,
  onHuyDoc = () => {},
  onDocXong = () => {},
  onNhanDuyet = () => {},
  onHuyDuyet = () => {},
  onEditDuyet = () => {},
}) {
  const navigate = useNavigate();
  const { userPackages, user, doctor } = useGlobalAuth();

  const availblePackage = getUsablePackageCodes(userPackages);

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [visionItemKeys, setVisionItemKeys] = useState([]);

  const emptyF = () => {};

  const items = [
    {
      key: KEY_ACTION_BUTTON.reset,
      label: "RESET",
      icon: <ReloadOutlined />,
      onClick: onReset ?? emptyF,
    },
    {
      key: KEY_ACTION_BUTTON.save,
      label: "LƯU (ĐỌC)",
      icon: <SaveOutlined />,
      color: "blue",
    },
    {
      key: KEY_ACTION_BUTTON.edit,
      label: `SỬA (ĐỌC)`,
      icon: <EditOutlined />,
      onClick: onEdit,
      color: "blue",
    },
    {
      key: KEY_ACTION_BUTTON.doc_xong,
      label: `ĐỌC XONG`,
      icon: <FileDoneOutlined />,
      onClick: onDocXong,
      color: "blue",
    },
    {
      key: KEY_ACTION_BUTTON.huy_doc,
      label: `HỦY ĐỌC`,
      icon: <DeleteOutlined />,
      onClick: onHuyDoc,
      color: "red",
    },
    {
      key: KEY_ACTION_BUTTON.nhan_duyet,
      label: `NHẬN DUYỆT`,
      icon: <FileWordOutlined />,
      onClick: onNhanDuyet,
      color: "green",
    },

    {
      key: KEY_ACTION_BUTTON.edit_duyet,
      label: `SỬA (DUYỆT)`,
      icon: <EditOutlined />,
      onClick: onEditDuyet,
      color: "green",
    },

    {
      key: KEY_ACTION_BUTTON.save_duyet,
      label: `LƯU (DUYỆT)`,
      icon: <SaveOutlined />,
      onClick: () => onAction(KEY_ACTION_BUTTON.save_duyet),
      color: "green",
    },
    {
      key: KEY_ACTION_BUTTON.duyet,
      label: "DUYỆT",
      icon: <CheckCircleOutlined />,
      onClick: onApprove ?? emptyF,
      color: "green",
    },

    {
      key: KEY_ACTION_BUTTON.huy_duyet,
      label: "HỦY DUYỆT",
      icon: <DeleteOutlined />,
      onClick: onHuyDuyet,
      color: "red",
    },
    {
      key: KEY_ACTION_BUTTON.preview,
      label: "XEM TRƯỚC",
      icon: <EyeOutlined />,
      onClick: onPreview ?? emptyF,
    },
    {
      key: KEY_ACTION_BUTTON.export,
      label: "EXPORT",
      icon: <ExportOutlined />,
      onClick: onPrint ?? emptyF,
      disabled: !editId,
    },
    {
      key: KEY_ACTION_BUTTON.AI,
      label: "AI GEN",
      icon: <GatewayOutlined />,
      onClick: onGenAi || emptyF,
    },
    {
      key: KEY_ACTION_BUTTON.print,
      label: "IN",
      icon: <PrinterOutlined />,
      onClick: onPrint || emptyF,
    },
    {
      key: KEY_ACTION_BUTTON.translate_multi,
      label: "DỊCH KHÁC",
      icon: <TranslationOutlined />,
      onClick: () => setLangModalOpen(true), // ✅ mở popup chọn ngôn ngữ
      disabled:
        !editId ||
        (!availblePackage.includes("HOSPITAL") &&
          user.id_role != USER_ROLE.ADMIN),
    },
    {
      key: KEY_ACTION_BUTTON.translate_en,
      label: "DỊCH ENGLISH",
      icon: <TranslationOutlined />,
      onClick: onTranslate || emptyF,
      disabled:
        !editId ||
        languageTranslate != "vi" ||
        (!hasProOrBusiness(userPackages) && user.id_role != USER_ROLE.ADMIN),
    },
    {
      key: KEY_ACTION_BUTTON.exit,
      label: "EXIT",
      icon: <LogoutOutlined />,
      color: "red",
      onClick: () => {
        if (onExit) {
          onExit();
        } else {
          navigate(-1);
        }
      },
    },
    {
      key: KEY_ACTION_BUTTON.sign,
      label: "KÝ",
      onClick: onSign ?? emptyF,
      icon: <SignatureOutlined />,
    },

    {
      key: "verifySign",
      label: "Xác thực chữ ký",
      icon: <SignatureOutlined />,
    },
  ];

  const genButtonC = (it) => {
    const disabledReason = (() => {
      return null;
    })();

    const btn = (
      <Button
        key={it.key}
        className={`${styles.btn}`}
        icon={it.icon}
        block
        onClick={() => (it.onClick ? it.onClick() : onAction?.(it.key))}
        disabled={it.disabled}
        style={{ borderBlockColor: it.color, borderColor: it.color }}
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

  useEffect(() => {
    const { status, id_doctor_in_processing, id_receive_doctor } =
      patientDiagnose || {};

    let keys = [];

    if (
      patientDiagnose?.id_doctor_in_processing !== doctor.id &&
      patientDiagnose?.id_receive_doctor !== doctor.id &&
      patientDiagnose?.id_verify_doctor !== doctor.id
    ) {
      return;
    }

    switch (status) {
      case PATIENT_DIAGNOSE_STATUS_CODE.NEW:
        keys = [KEY_ACTION_BUTTON.exit];
        break;

      case PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION:
        keys = [KEY_ACTION_BUTTON.exit];
        break;

      case PATIENT_DIAGNOSE_STATUS_CODE.IN_PROCESSING:
        if (
          id_doctor_in_processing != doctor.id &&
          id_receive_doctor != doctor.id
        ) {
          keys = [KEY_ACTION_BUTTON.exit];
        } else {
          keys = [
            id_doctor_in_processing == doctor.id
              ? KEY_ACTION_BUTTON.reset
              : null,
            id_doctor_in_processing == doctor.id
              ? editId && !isEdit
                ? KEY_ACTION_BUTTON.edit
                : KEY_ACTION_BUTTON.save
              : null,
            id_doctor_in_processing == doctor.id
              ? KEY_ACTION_BUTTON.doc_xong
              : null,
            KEY_ACTION_BUTTON.exit,
            id_doctor_in_processing == doctor.id
              ? KEY_ACTION_BUTTON.huy_doc
              : null,
          ].filter(Boolean);
        }
        break;

      case PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE:
        if (
          id_doctor_in_processing != doctor.id &&
          id_receive_doctor != doctor.id
        ) {
          keys = [KEY_ACTION_BUTTON.exit];
        } else {
          keys = [
            editId && !isEdit ? KEY_ACTION_BUTTON.edit : KEY_ACTION_BUTTON.save,
            KEY_ACTION_BUTTON.exit,
            KEY_ACTION_BUTTON.huy_doc,
            KEY_ACTION_BUTTON.nhan_duyet,
            KEY_ACTION_BUTTON.duyet,
          ];
        }
        break;

      case PATIENT_DIAGNOSE_STATUS_CODE.WAIT_VERIFY:
        if (
          id_doctor_in_processing != doctor.id &&
          id_receive_doctor != doctor.id
        ) {
          keys = [KEY_ACTION_BUTTON.exit];
        } else {
          keys = [
            patientDiagnose.id_verify_doctor == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id
              ? KEY_ACTION_BUTTON.reset
              : null,
            KEY_ACTION_BUTTON.exit,
            patientDiagnose.id_verify_doctor == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id
              ? KEY_ACTION_BUTTON.huy_duyet
              : null,
            patientDiagnose.id_verify_doctor == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id
              ? editId && !isEdit
                ? KEY_ACTION_BUTTON.edit_duyet
                : KEY_ACTION_BUTTON.save_duyet
              : null,
            patientDiagnose.id_verify_doctor == doctor.id ||
            patientDiagnose.id_receive_doctor == doctor.id
              ? KEY_ACTION_BUTTON.duyet
              : null,
          ].filter(Boolean);
        }
        break;

      case PATIENT_DIAGNOSE_STATUS_CODE.VERIFIED:
        if (
          id_doctor_in_processing != doctor.id &&
          id_receive_doctor != doctor.id
        ) {
          keys = [KEY_ACTION_BUTTON.exit];
        } else {
          keys = [
            KEY_ACTION_BUTTON.exit,
            KEY_ACTION_BUTTON.huy_duyet,
            KEY_ACTION_BUTTON.print,
            KEY_ACTION_BUTTON.preview,
            editId && !isEdit
              ? KEY_ACTION_BUTTON.edit_duyet
              : KEY_ACTION_BUTTON.save_duyet,
          ];
        }
        break;

      default:
        keys = [KEY_ACTION_BUTTON.exit];
        break;
    }

    setVisionItemKeys(keys);
  }, [patientDiagnose, doctor?.id, editId, isEdit]);

  return (
    <div className="no-print">
      <div className={styles.actionBar}>
        <div className={styles.actionGrid}>
          {!actionKeys?.length
            ? items
                .filter((it) => visionItemKeys.includes(it.key))
                .map((it) => genButtonC(it))
            : items
                .filter((i) => actionKeys.includes(i.key))
                .map((it) => genButtonC(it))}
        </div>
      </div>

      <Modal
        className="no-print"
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
    </div>
  );
}
