import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Checkbox,
  Dropdown,
  Space,
  Divider,
  Typography,
  Input,
  Row,
  Col,
  Tag,
  Select,
  message,
  DatePicker,
  ConfigProvider,
  Grid,
  Tooltip,
  Popover,
} from "antd";
import {
  SettingOutlined,
  UserAddOutlined,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
  ApartmentOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_CODE,
  USER_ROLE,
  getPatientDiagnoseIcon,
} from "../../constant/app";

import { toast } from "react-toastify";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import styles from "./PatientDiagnoseList.module.scss";
import ColumnSettingModal from "./setting/ColumnSettingModal";
import DragDropExample from "./setting/ColumnSettingModal";
import PatientDiagnoiseDetailPage from "./Detail/DetailPatientDiagnose";

import useTemplateServicesAndExamParts from "../../hooks/useTemplateServicesAndExamParts";
import ReloadTSAndExamPartsButton from "../../components/ReloadTSAndExamPartsButton";
import ResizableTitle from "./setting/ResizableTitle";
import FlowModal from "./setting/nodes/FlowModal";
import ImportPatientModal from "./Import/ImportPatientModal";

import { PATIENT_DIAGNOSE_STATUS_FILTER } from "./constant.patient";
import DoctorUseDFormVer3 from "../formver3/doctor_use_formver3/use/DoctorIUseFormVer3";
import { stepsStatus, calculateAge } from "../formver3/formver3.constant";
import ConsultationSelectModal from "../formver3/components/ConsultationSelectModal/ConsultationSelectModal";
import CustomSteps from "../../components/CustomSteps/CustomSteps";
import {
  getProvinceNameByCode,
  getWardNameByCode,
} from "../../hooks/useVietnamAddress";
import TranslateListRecordsVer3 from "../formver3/components/TranslateListRecordsVer3";
import FormVer3GroupProcessPatientDiagnoise from "../formver3/FormVer3GroupProcessPatientDiagnoise";

const { Option } = Select;
const COLUMN_SETTING_STORAGE_KEY = "patientDiagnose_column_settings";

const DATE_OPTIONS = [
  { label: "Tất cả", value: null },
  { label: "Hôm nay", value: "today" },
  { label: "Hôm qua", value: "yesterday" },
  { label: "Tuần này", value: "this_week" },
  { label: "Phạm vi", value: "range" },
];

const defaultVisibleKeys = [
  "STT",
  "id",
  "name",
  "birth_year",
  "status",
  "dob",
  "gender",
  "Indication",
  "action",
];

const STORAGE_KEY = "visibleColumns_patientDiagnose";

const PatientMiniInfo = ({ patient, templateServices, examParts }) => {
  const displayData = {
    name: (patient?.name || "")?.toUpperCase(),
    gender: patient?.gender || "-",
    birth_year: patient?.birth_year || "",
    age: calculateAge(patient?.dob, patient?.birth_year) || "-",
    phone: patient?.phoneNumber || "-",
    PID: patient?.PID || "-",
    SID: patient?.SID || "-",
    CCCD: patient?.CCCD || "-",
    email: patient?.email || "-",
    clinical: patient?.Indication || "Không có thông tin lâm sàng",
  };

  const indicationName = templateServices?.find(
    (t) => t.id == patient?.id_template_service,
  )?.name || "-";

  const examPartName = examParts?.find(
    (t) => t.id == patient?.id_exam_part,
  )?.name || "-";

  return (
    <div style={{ width: 400, padding: "4px", fontFamily: "Inter, sans-serif" }}>
      {/* Header gradient banner */}
      <div style={{ 
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", 
        padding: "12px 14px", 
        borderRadius: "6px", 
        marginBottom: "12px",
        border: "1px solid #bfdbfe"
      }}>
        <span style={{ color: "#2563eb", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          BỆNH NHÂN
        </span>
        <h4 style={{ margin: "2px 0 6px 0", fontSize: "15px", fontWeight: "700", color: "#1e3a8a" }}>
          {displayData.name}
        </h4>
        <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#1e40af" }}>
          <span>Giới tính: <strong>{displayData.gender}</strong></span>
          <span>Năm sinh: <strong>{displayData.birth_year}</strong></span>
          <span>Tuổi: <strong>{displayData.age}</strong></span>
        </div>
      </div>

      {/* Grid details */}
      <Row gutter={[12, 10]} style={{ padding: "0 4px" }}>
        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>PID</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{displayData.PID}</span>
        </Col>
        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>SID</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626", wordBreak: "break-all", lineHeight: 1.1 }}>{displayData.SID}</span>
        </Col>
        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>CCCD</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{displayData.CCCD}</span>
        </Col>

        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Mã ca (ID)</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{patient.id}</span>
        </Col>
        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>SĐT</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{displayData.phone}</span>
        </Col>
        <Col span={8}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Email</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626", wordBreak: "break-all", lineHeight: 1.1 }}>{displayData.email}</span>
        </Col>

        <Col span={12}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Chỉ định</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{indicationName}</span>
        </Col>
        <Col span={12}>
          <span style={{ color: "#8c8c8c", display: "block", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>Bộ phận khám</span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#262626" }}>{examPartName}</span>
        </Col>
      </Row>

      <Divider style={{ margin: "10px 0" }} />

      {/* Clinical Diagnosis section */}
      <div style={{ padding: "0 4px" }}>
        <span style={{ color: "#c2410c", display: "block", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
          Thông tin lâm sàng
        </span>
        <div style={{ 
          background: "#fff7ed", 
          border: "1px solid #ffedd5", 
          borderRadius: "6px", 
          padding: "8px 10px", 
          fontSize: "11px", 
          color: "#c2410c", 
          fontWeight: "500",
          lineHeight: "1.4"
        }}>
          {displayData.clinical}
        </div>
      </div>
    </div>
  );
};

const PatientTablePage = ({ PID = null }) => {
  const containerRef = React.useRef(null);
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem("patient_diagnose_left_width");
    return saved ? parseFloat(saved) : 50;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isResizerHovered, setIsResizerHovered] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidthPercent = leftWidth;
    const containerWidth = containerRef?.current?.getBoundingClientRect()?.width || 1200;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newPercent = startWidthPercent + deltaPercent;

      if (newPercent < 20) newPercent = 20;
      if (newPercent > 80) newPercent = 80;

      setLeftWidth(newPercent);
      localStorage.setItem("patient_diagnose_left_width", newPercent.toString());
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const navigate = useNavigate();
  const { useBreakpoint } = Grid;

  const screens = useBreakpoint();

  const deviceIsMobile = !screens.md;

  const [data, setData] = useState([]);
  const [sameCCCDData, setSameCCCDData] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [customColumns, setCustomColumns] = useState([]);

  const [doctorUseFormVer3Id, setDoctorUseFormVer3Id] = useState(null);

  const [rightPanelMode, setRightPanelMode] = useState("detail");
  const [openConsultationModal, setOpenConsultationModal] = useState(false);

  const [translateOpen, setTranslateOpen] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState([]);
  const {
    user,
    examParts,
    templateServices,
    clinicsAll,
    setIsOnWorkList,
    setCollapsed,
    filterPatient: pendingFilters,
    setFilterPatient: setPendingFilters,
    setTotalPatient: setTotal,
    totalPatient: total,
    selectedPatientDiagnose,
    setSelectedPatientDiagnose,
    socket,
    doctor,
    numberLanguageDoctorUseFormV3,
    languageTranslate,
    setLanguageTransslate,
    selectedDoctorUseFormVer3,
    setSelectedDoctorUseFormVer3,
  } = useGlobalAuth();

  const { fetchTSAndExamParts } = useTemplateServicesAndExamParts();

  useEffect(() => {
    if (!socket) return;

    const handlePatientUpdated = (payload) => {
      const updatedRecord = payload?.data || payload;

      if (!updatedRecord?.id) return;

      setSelectedPatientDiagnose(updatedRecord);

      console.log("=== PatientDiagnoseList received socket update: patient-diagnose-updated ===", updatedRecord);

      setData((prev) =>
        prev.map((item) =>
          item.id === updatedRecord.id
            ? {
              ...item,
              ...updatedRecord,
            }
            : item,
        ),
      );

      setSameCCCDData((prev) =>
        prev.map((item) =>
          item.id === updatedRecord.id
            ? {
              ...item,
              ...updatedRecord,
            }
            : item,
        ),
      );

      setSelectedPatientDiagnose((prev) => {
        if (!prev) return prev;

        if (prev.id === updatedRecord.id) {
          return {
            ...prev,
            ...updatedRecord,
          };
        }

        return prev;
      });
    };

    socket.on("patient-diagnose-updated", handlePatientUpdated);

    return () => {
      socket.off("patient-diagnose-updated", handlePatientUpdated);
    };
  }, [socket]);

  useEffect(() => {
    setIsOnWorkList(true);
    setCollapsed(true);
    fetchTSAndExamParts();
    return () => setIsOnWorkList(false);
  }, []);

  const [filters, setFilters] = useState({
    PID: PID,
  });

  useEffect(() => {
    setPage(1);
    setFilters(pendingFilters);
  }, [pendingFilters]);

  const allColumns = useMemo(
    () => [
      {
        title: "",
        key: "STT",
        align: "center", // ✅ CĂN BÊN PHẢI
        width: 40,
        render: (_, __, index) => (page - 1) * 10 + index + 1,
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        fixed: "left",
        width: 60,
        align: "center",
        sorter: true,
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 115,
        render: (status) => (
          <Tag
            style={{
              width: 96,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px 0",
            }}
            color={PATIENT_DIAGNOSE_COLOR[status]}
          >
            {getPatientDiagnoseIcon(status, { style: { marginRight: 4 }, spin: status === 3 })}
            <span>{PATIENT_DIAGNOSE_STATUS[status]}</span>
          </Tag>
        ),
        sorter: true,
      },
      {
        title: "Họ tên",
        dataIndex: "name",
        key: "name",
        width: 200,
        sorter: true,
      },

      {
        title: "Năm sinh",
        dataIndex: "birth_year",
        key: "birth_year",
        width: 80,
        align: "center",
      },
      { title: "CCCD", dataIndex: "CCCD", key: "CCCD", width: 160 },
      {
        title: "Lâm sàng",
        dataIndex: "Indication",
        key: "Indication",
        width: 260,
      },

      {
        width: 170,
        title: "Phân hệ",
        dataIndex: "id_template_service",
        key: "id_template_service",
        render: (val) => templateServices?.find((t) => t.id == val)?.name,
      },

      { title: "PID", dataIndex: "PID", key: "PID", width: 120 },
      { title: "SID", dataIndex: "SID", key: "SID", width: 120 },
      {
        title: "SĐT",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 140,
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        width: 80,
        align: "center",
      },
      {
        width: 150,
        title: "Bộ phận",
        dataIndex: "id_exam_part",
        key: "id_exam_part",
        render: (val) => examParts?.find((t) => t.id == val)?.name,
      },

      {
        width: 220,
        title: "Phòng khám",
        dataIndex: "id_clinic",
        key: "id_clinic",
        render: (val) => clinicsAll?.find((t) => t.id == val)?.name,
      },

      { title: "Email", dataIndex: "email", key: "email", width: 200 },
      { title: "Địa chỉ", dataIndex: "address", key: "address", width: 220 },
      {
        title: "Quốc tịch",
        dataIndex: "countryCode",
        key: "countryCode",
        width: 140,
      },
      {
        title: "Tỉnh/TP",
        dataIndex: "province_code",
        key: "province_code",
        render: (val) => getProvinceNameByCode(val),

        width: 140,
      },
      {
        title: "Phường/Xã",
        dataIndex: "ward_code",
        key: "ward_code",
        render: (val) => getWardNameByCode(val),
        width: 140,
      },

      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (value) =>
          value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--",
      },
      {
        title: "Ngày cập nhật",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        render: (value) =>
          value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--",
      },

      {
        title: "Người đọc",
        key: "processingDoctor",
        width: 220,
        render: (_, record) => {
          const d = record?.id_doctor_in_processing_doctor;
          if (!d) return <span style={{ color: "#999" }}>Chưa phân công</span>;

          const title = [d.academic_title, d.degree].filter(Boolean).join(".");

          return (
            <span>
              {title + ". "}

              {d.full_name}
            </span>
          );
        },
      },
      {
        title: "Hành động",
        key: "action",
        fixed: "right",
        width: 120,
        render: (_, record) =>
          (user?.id_role === USER_ROLE.ADMIN ||
            record.createdBy === user?.id) && (
            <Space>
              <Button
                icon={<EditOutlined />} //  Nút cập nhật
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/home/patients-diagnose/edit/" + record.id);
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                type="text"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(record.id);
                }}
              />

              <Button
                icon={<CopyOutlined />}
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClone(record);
                }}
              />
            </Space>
          ),
      },
    ],
    [user, clinicsAll, examParts, templateServices, page],
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, page, limit]);

  useEffect(() => {
    if (selectedPatientDiagnose) {
      fetchPatientsByChosen();
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [selectedPatientDiagnose]);

  const cleanParams = (obj) => {
    if (!obj) return {};
    const cleaned = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        cleaned[key] = value;
      }
    });

    return cleaned;
  };

  const fetchPatients = async (filters) => {
    try {
      const res = await API_CALL.get("/patient-diagnose", {
        params: {
          ...cleanParams(filters),
          page,
          limit,
          sort_by: filters?.sort_by,
          sort_order: filters?.sort_order,
        },
      });
      const responseData = res.data.data;
      setData(responseData?.rows || []);
      setTotal(responseData?.count || 0);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  const fetchPatientsByChosen = async () => {
    try {
      if (!selectedPatientDiagnose?.CCCD && !selectedPatientDiagnose?.PID) {
        setSameCCCDData([]);
        return;
      }
      const res = selectedPatientDiagnose?.CCCD
        ? await API_CALL.get("/patient-diagnose", {
          params: { CCCD: selectedPatientDiagnose?.CCCD, page: 1, limit: 20 },
        })
        : await API_CALL.get("/patient-diagnose", {
          params: { PID: selectedPatientDiagnose?.PID, page: 1, limit: 20 },
        });
      const responseData = res.data.data;
      setSameCCCDData(responseData?.rows || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;
    try {
      await API_CALL.del(`/patient-diagnose/${id}`);
      message.success("Xóa thành công");
      fetchPatients();
    } catch (err) {
      message.error("Xóa thất bại, vui lòng thử lại");
    }
  };

  const handleClone = async (record) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const payload = {
        ...record,
        id: undefined,
        name: `${record.name} - Copy ${timestamp}`,
        status: PATIENT_DIAGNOSE_STATUS_CODE.NEW,
      };
      await API_CALL.post("/patient-diagnose", payload);
      toast.success("Đã clone thành công");
      fetchPatients();
    } catch (err) {
      toast.error("Clone thất bại");
    }
  };

  const columnsToRender = useMemo(
    () =>
      allColumns.filter(
        (col) => Array.isArray(visibleKeys) && visibleKeys.includes(col.key),
      ),
    [visibleKeys, allColumns],
  );

  const handleSaveColumnSettings = ({
    orderedKeys,
    visibleKeys: newVisibleKeys,
    widths,
  }) => {
    const payload = {
      orderedKeys,
      visibleKeys: newVisibleKeys,
      widths,
    };

    localStorage.setItem(COLUMN_SETTING_STORAGE_KEY, JSON.stringify(payload));

    // rebuild columns
    const finalColumns = orderedKeys
      .map((key) => allColumns.find((c) => c.key === key))
      .filter((col) => col && newVisibleKeys.includes(col.key))
      .map((col) => ({
        ...col,
        width: widths[col.key] ?? col.width,
      }));

    setVisibleKeys(newVisibleKeys);
    setCustomColumns(finalColumns);
  };

  const tableColumns =
    customColumns.length > 0 ? customColumns : columnsToRender;

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };
  const handleResize =
    (key) =>
      (e, { size }) => {
        setCustomColumns((prev) => {
          const next = prev.map((col) =>
            col.key === key
              ? {
                ...col,
                width: size.width,
              }
              : col,
          );

          // save localStorage
          const saved = JSON.parse(
            localStorage.getItem(COLUMN_SETTING_STORAGE_KEY) || "{}",
          );

          localStorage.setItem(
            COLUMN_SETTING_STORAGE_KEY,
            JSON.stringify({
              ...saved,
              widths: {
                ...(saved.widths || {}),
                [key]: size.width,
              },
            }),
          );

          return next;
        });
      };

  useEffect(() => {
    const saved = localStorage.getItem(COLUMN_SETTING_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        const orderedKeys = Array.isArray(parsed.orderedKeys)
          ? parsed.orderedKeys
          : allColumns.map((c) => c.key);

        const visibleKeys = Array.isArray(parsed.visibleKeys)
          ? parsed.visibleKeys
          : defaultVisibleKeys;

        const widths = parsed.widths || {};

        setVisibleKeys(visibleKeys);

        const restored = orderedKeys
          .map((key) => allColumns.find((c) => c.key === key))
          .filter(Boolean)
          .filter((c) => visibleKeys.includes(c.key))
          .map((c) => ({
            ...c,
            width: widths?.[c.key] ?? c.width,
          }));

        setCustomColumns(restored);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // fallback lần đầu
    const fallback = allColumns.filter((c) =>
      defaultVisibleKeys.includes(c.key),
    );
    setCustomColumns(fallback);
  }, [allColumns]);

  const mergedColumns = useMemo(
    () =>
      customColumns.map((col) => ({
        ...col,
        onHeaderCell: () => ({
          width: col.width,
          onResize: handleResize(col.key),
        }),
      })),
    [customColumns],
  );

  const onCheckandCreate = async () => {
    try {
      if (
        templateServices
          .find((t) => t.id == selectedPatientDiagnose.id_template_service)
          ?.code.toUpperCase()
          .includes("SASK")
      ) {
        const sonoResult = await API_CALL.get(`/sono`, {
          params: {
            id_patient_diagnose: selectedPatientDiagnose.id,
            // id_doctor: doctor.id,
          },
        });

        if (sonoResult.data.data.data.data?.length) {
          navigate(`/home/sono/bung/${sonoResult.data.data.data.data[0].id}`);
        } else {
          navigate(`/home/sono/use/patient-diagnose/${id}`);
        }
      } else {
        setRightPanelMode("reading");
        // if (doctorUseDFormVer3.data.data.data?.length) {
        //   navigate(
        //     `/home/doctor-use-formver3/detail/${doctorUseDFormVer3.data.data.data[0].id}/${patientDiagnose.status == PATIENT_DIAGNOSE_STATUS_NAME.VERIFIED}`,
        //   );
        // } else {
        //   navigate(`/home/form-drad-v3/use/patient-diagnose/${id}`);
        // }
      }
    } catch (error) {
      toast.error("Không cập nhật được trạng thái đọc ca bệnh");
    }
  };

  const handleStatusChange = () => {
    fetchPatients(filters);
    fetchPatientsByChosen();
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: !deviceIsMobile ? "row" : "column",
        gap: !deviceIsMobile && selectedPatientDiagnose ? 0 : 8,
      }}
    >
      <div
        style={{
          padding: 0,
          width: !deviceIsMobile && selectedPatientDiagnose ? `${leftWidth}%` : "100%",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            background: "#ffffff",
            padding: "6px 8px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            marginBottom: "10px",
            width: "100%",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "wrap",
              width: deviceIsMobile ? "100%" : "auto",
            }}
          >
            {DATE_OPTIONS.map(({ label, value }) => {
              const isActive = pendingFilters.date_type === value;
              return (
                <Button
                  key={value}
                  size="small"
                  onClick={() => {
                    setPendingFilters({
                      ...pendingFilters,
                      date_type: value,
                      ...(value !== "range" && {
                        from_date: null,
                        to_date: null,
                      }),
                    });
                  }}
                  style={{
                    fontSize: "12px",
                    height: 28,
                    padding: "0 10px",
                    borderRadius: "4px",
                    border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    background: isActive ? "#2563eb" : "#f8fafc",
                    color: isActive ? "#ffffff" : "#475569",
                    fontWeight: isActive ? "600" : "500",
                    boxShadow: isActive ? "0 1px 3px rgba(37, 99, 235, 0.2)" : "none",
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>

          {pendingFilters.date_type === "range" && (
            <RangePicker
              size="small"
              style={{
                width: deviceIsMobile ? "100%" : 220,
                height: 28,
                fontSize: "12px",
                borderRadius: "4px",
                borderColor: "#cbd5e1",
              }}
              onChange={(dates) =>
                setPendingFilters({
                  ...pendingFilters,
                  from_date: dates?.[0]
                    ? dayjs(dates[0]).format("YYYY-MM-DD")
                    : null,
                  to_date: dates?.[1]
                    ? dayjs(dates[1]).format("YYYY-MM-DD")
                    : null,
                })
              }
            />
          )}

          {!deviceIsMobile && <div style={{ flex: 1 }} />}

          <Tooltip title={"Cấu hình cột"}>
            <Button
              size="small"
              onClick={() => setOpenColumnModal(true)}
              icon={<SettingOutlined style={{ fontSize: "14px", color: "#475569" }} />}
              style={{
                height: 28,
                width: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                borderColor: "#cbd5e1",
                background: "#f8fafc",
              }}
            />
          </Tooltip>
        </div>

        <Divider style={{ margin: 0, marginBottom: 10 }} />
        <ConfigProvider
          theme={{
            components: {
              Table: {
                fontSize: 11,
                cellPaddingBlock: 0,
              },
            },
          }}
        >
          <div
            style={{
              position: "relative",
              overflowX: "auto",
              width: "100%",
            }}
          >
            <Table
              rowKey="id"
              size="small"
              rootClassName={styles.patientTable}
              components={components}
              columns={mergedColumns}
              dataSource={data}
              bordered
              scroll={{
                x: mergedColumns.reduce(
                  (total, col) => total + (col.width || 120),
                  0,
                ),
                y: 800,
              }}
              pagination={{
                current: page,
                pageSize: limit,
                total,
                showSizeChanger: true,
                position: ["bottomCenter"],
                onChange: (p, l) => {
                  setPage(p);
                  setLimit(l);
                },
              }}
              rowClassName={(record) =>
                selectedPatientDiagnose?.id === record.id
                  ? styles.selectedRow
                  : ""
              }
              onRow={(record) => ({
                onClick: () => {
                  setRightPanelMode("detail");
                  setSelectedPatientDiagnose(record);
                },
                style: { cursor: "pointer" },
              })}
              onChange={(pagination, _filters, sorter) => {
                const nextPage = pagination.current;
                const nextLimit = pagination.pageSize;

                const nextSortBy = sorter?.field;
                const nextSortOrder =
                  sorter?.order === "ascend"
                    ? "asc"
                    : sorter?.order === "descend"
                      ? "desc"
                      : undefined;

                const sortChanged =
                  nextSortBy !== filters.sort_by ||
                  nextSortOrder !== filters.sort_order;

                if (nextPage !== page || nextLimit !== limit) {
                  setPage(nextPage);
                  setLimit(nextLimit);
                }

                if (sortChanged) {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    sort_by: nextSortBy,
                    sort_order: nextSortOrder,
                  }));
                }
              }}
            />
          </div>
        </ConfigProvider>
        {sameCCCDData.length > 0 && selectedPatientDiagnose && (
          <>
            <Divider style={{ margin: "6px 0" }} />

            <Typography.Text strong style={{ color: "#1e3a8a", fontSize: "11px", display: "block", marginBottom: "4px" }}>
              Lịch sử ca khám của {selectedPatientDiagnose?.name} ({sameCCCDData.length} ca)
            </Typography.Text>

            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    fontSize: 11,
                    cellPaddingBlock: 0,
                  },
                },
              }}
            >
              <Table
                rowKey="id"
                size="small"
                rootClassName={styles.patientTable}
                tableLayout="fixed"
                columns={mergedColumns}
                dataSource={sameCCCDData}
                bordered
                pagination={false}
                scroll={{
                  x: mergedColumns.reduce(
                    (total, col) => total + (col.width || 120),
                    0,
                  ),
                }}
                style={{ marginTop: 8 }}
                onRow={(record) => ({
                  onClick: () => {
                    !deviceIsMobile
                      ? setSelectedPatientDiagnose(record)
                      : navigate(`/home/patients-diagnose/${record.id}`);
                  },
                  style: { cursor: "pointer", background: "#fafafa" },
                })}
              />
            </ConfigProvider>
          </>
        )}
      </div>
      {!deviceIsMobile && selectedPatientDiagnose && (
        <div
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsResizerHovered(true)}
          onMouseLeave={() => setIsResizerHovered(false)}
          style={{
            width: "6px",
            cursor: "col-resize",
            background: isResizing || isResizerHovered ? "#3b82f6" : "#e2e8f0",
            alignSelf: "stretch",
            zIndex: 10,
            transition: "background 0.2s, width 0.2s",
            margin: "0 4px",
            borderRadius: "3px",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Grab indicator line in the middle */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "2px",
            height: "30px",
            background: isResizing || isResizerHovered ? "#ffffff" : "#a1a1aa",
            borderRadius: "1px",
            transition: "background 0.2s",
          }} />
        </div>
      )}
      {selectedPatientDiagnose && (
        <div
          style={{
            padding: 0,
            flex: 1,
            maxHeight: "115vh",
            overflowY: "scroll",
          }}
        >
          <div
            style={{
              position: "fixed",
              zIndex: 3,
              display: "flex",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              alignItems: "center",
              padding: "4px 8px",
              gap: "8px",
              borderRadius: "4px",
            }}
          >
            <Button
              type="primary"
              ghost
              size="small"
              style={{
                borderColor: "#34d399",
                color: "#059669",
                fontSize: "11px",
                height: "22px",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                fontWeight: "500",
              }}
              onClick={() => setTranslateOpen(true)}
            >
              Bản dịch: {numberLanguageDoctorUseFormV3}
            </Button>
            <CustomSteps
              steps={stepsStatus({
                setOpenConsultationModal,
                onCheckandCreate,
                isConsultation: !!selectedPatientDiagnose.id_consulting_doctor || selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION,
              })}
              current={stepsStatus({
                setOpenConsultationModal,
                onCheckandCreate,
                isConsultation: !!selectedPatientDiagnose.id_consulting_doctor || selectedPatientDiagnose.status === PATIENT_DIAGNOSE_STATUS_CODE.CONSULTATION,
              }).findIndex((s) => s.key === selectedPatientDiagnose.status)}
              is_consultation_doctor={
                selectedPatientDiagnose.id_consulting_doctor
              }
            />
            {rightPanelMode === "reading" && (
              <Popover
                content={
                  <PatientMiniInfo
                    patient={selectedPatientDiagnose}
                    templateServices={templateServices}
                    examParts={examParts}
                  />
                }
                title={
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#1d4ed8" }}>
                    Thông tin hành chính bệnh nhân
                  </span>
                }
                trigger="click"
                placement="bottomLeft"
              >
                <Button
                  icon={<UserOutlined />}
                  style={{
                    marginLeft: 20,
                    borderRadius: "4px",
                    borderColor: "#3b82f6",
                    color: "#1d4ed8",
                    fontSize: "11px",
                    height: "22px",
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "500",
                  }}
                >
                  Thông tin BN
                </Button>
              </Popover>
            )}
          </div>
          <div>
            {/* Fixed bottom action bar — rendered once at this level to avoid
                overlap with FormActionBar (position:fixed) in reading mode */}
            {selectedPatientDiagnose && (
              <div style={{ display: rightPanelMode === "detail" ? "block" : "none" }}>
                <FormVer3GroupProcessPatientDiagnoise
                  patientDiagnose={selectedPatientDiagnose}
                  setPatientDiagnose={setSelectedPatientDiagnose}
                  onStatusChange={handleStatusChange}
                  onClose={() => setSelectedPatientDiagnose(null)}
                  onOpenReading={() => setRightPanelMode("reading")}
                />
              </div>
            )}
            {rightPanelMode === "detail" ? (
              <PatientDiagnoiseDetailPage
                idFromList={selectedPatientDiagnose?.id}
                onOpenReading={() => setRightPanelMode("reading")}
                onClose={() => setSelectedPatientDiagnose(null)}
                setDoctorUseFormVer3Id={setDoctorUseFormVer3Id}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <DoctorUseDFormVer3
                patient_diagnose_id={selectedPatientDiagnose?.id}
                isUse={true}
                onBackDetail={() => setRightPanelMode("detail")}
                doctorUseFormVer3Id={doctorUseFormVer3Id}
                onStatusChange={handleStatusChange}
                onOpenConsultation={() => setOpenConsultationModal(true)}
              />
            )}
          </div>
        </div>
      )}

      <ColumnSettingModal
        open={openColumnModal}
        onClose={() => setOpenColumnModal(false)}
        allColumns={allColumns}
        visibleKeys={visibleKeys}
        columnSettings={JSON.parse(
          localStorage.getItem(COLUMN_SETTING_STORAGE_KEY) || "{}",
        )}
        onSave={handleSaveColumnSettings}
      />

      <ConsultationSelectModal
        open={openConsultationModal}
        onClose={() => setOpenConsultationModal(false)}
        onGoReading={() => setRightPanelMode("reading")}
        onStatusChange={handleStatusChange}
      />

      <TranslateListRecordsVer3
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        id_patient_diagnose={selectedPatientDiagnose?.id}
        selectedDoctorUseFormVer3={selectedDoctorUseFormVer3}
        setLanguageTransslate={setLanguageTransslate}
        setSelectedDoctorUseFormVer3={setSelectedDoctorUseFormVer3}
      />
    </div>
  );
};

export default PatientTablePage;
