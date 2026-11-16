import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Table,
  Divider,
  ConfigProvider,
  Grid,
} from "antd";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
} from "../../constant/app";
import { toast } from "react-toastify";
import styles from "./PatientDiagnoseList.module.scss";
import useTemplateServicesAndExamParts from "../../hooks/useTemplateServicesAndExamParts";
import ResizableTitle from "./setting/ResizableTitle";
import useConfirmAction from "../../hooks/useConfirmAction";

import usePatientDiagnoseColumns from "./components/usePatientDiagnoseColumns";
import PatientDiagnoseFilterBar from "./components/PatientDiagnoseFilterBar";
import PatientDiagnoseRightPanel from "./components/PatientDiagnoseRightPanel";
import PatientDiagnoseModals from "./components/PatientDiagnoseModals";

const COLUMN_SETTING_STORAGE_KEY = "patientDiagnose_column_settings";
const STORAGE_KEY = "visibleColumns_patientDiagnose";
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

const PatientTablePage = ({ PID = null }) => {
  const containerRef = useRef(null);
  const { confirmState, openConfirm } = useConfirmAction();
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

  const screens = Grid.useBreakpoint();
  const deviceIsMobile = screens.md === false;
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [sameCCCDData, setSameCCCDData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [customColumns, setCustomColumns] = useState([]);
  const [doctorUseFormVer3Id, setDoctorUseFormVer3Id] = useState(null);
  const [rightPanelMode, setRightPanelMode] = useState("detail");
  const [initEditMode, setInitEditMode] = useState(false);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [openDicomModal, setOpenDicomModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState([]);
  const { user, examParts, templateServices, clinicsAll, setIsOnWorkList, setCollapsed, filterPatient: pendingFilters, setFilterPatient: setPendingFilters, setTotalPatient: setTotal, totalPatient: total, selectedPatientDiagnose, setSelectedPatientDiagnose, socket, doctor, numberLanguageDoctorUseFormV3, setLanguageTransslate, selectedDoctorUseFormVer3, setSelectedDoctorUseFormVer3 } = useGlobalAuth();

  const { fetchTSAndExamParts } = useTemplateServicesAndExamParts();

  useEffect(() => {
    if (!socket) return;
    const handlePatientUpdated = (payload) => {
      const updatedRecord = payload?.data || payload;
      if (!updatedRecord?.id) return;
      setSelectedPatientDiagnose(updatedRecord);
      setData((prev) => prev.map((item) => (item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item)));
      setSameCCCDData((prev) => prev.map((item) => (item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item)));
    };

    socket.on("patient-diagnose-updated", handlePatientUpdated);
    return () => socket.off("patient-diagnose-updated", handlePatientUpdated);
  }, [socket, setSelectedPatientDiagnose]);

  useEffect(() => {
    setIsOnWorkList(true);
    setCollapsed(true);
    fetchTSAndExamParts();
    return () => setIsOnWorkList(false);
  }, []);

  const [filters, setFilters] = useState({ PID: PID });

  useEffect(() => {
    setPage(1);
    setFilters(pendingFilters);
  }, [pendingFilters]);

  const handleDelete = (id) => {
    openConfirm({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bản ghi này?",
      onConfirm: async () => {
        try {
          await API_CALL.del(`/patient-diagnose/${id}`);
          toast.success("Xóa thành công");
          fetchPatients(filters);
        } catch (err) {
          toast.error("Xóa thất bại, vui lòng thử lại");
        }
      },
    });
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
      fetchPatients(filters);
    } catch (err) {
      toast.error("Clone thất bại");
    }
  };

  const allColumns = usePatientDiagnoseColumns({
    page,
    user,
    clinicsAll,
    examParts,
    templateServices,
    navigate,
    handleDelete,
    handleClone,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
  }, []);

  const cleanParams = (obj) => {
    if (!obj) return {};
    const cleaned = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const fetchPatients = async (flts) => {
    try {
      const res = await API_CALL.get("/patient-diagnose", {
        params: {
          ...cleanParams(flts),
          page,
          limit,
          sort_by: flts?.sort_by,
          sort_order: flts?.sort_order,
        },
      });
      const responseData = res.data?.data;
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
      const res = await API_CALL.get("/patient-diagnose", {
        params: {
          CCCD: selectedPatientDiagnose?.CCCD || undefined,
          PID: !selectedPatientDiagnose?.CCCD ? selectedPatientDiagnose?.PID : undefined,
          page: 1,
          limit: 100,
        },
      });
      setSameCCCDData(res.data?.data?.rows || []);
    } catch (err) {}
  };

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

  const handleSaveColumnSettings = ({ orderedKeys, visibleKeys: newVisibleKeys, widths }) => {
    localStorage.setItem(COLUMN_SETTING_STORAGE_KEY, JSON.stringify({ orderedKeys, visibleKeys: newVisibleKeys, widths }));
    const finalColumns = orderedKeys
      .map((key) => allColumns.find((c) => c.key === key))
      .filter((col) => col && newVisibleKeys.includes(col.key))
      .map((col) => ({ ...col, width: widths[col.key] ?? col.width }));
    setVisibleKeys(newVisibleKeys);
    setCustomColumns(finalColumns);
  };

  const clampColWidth = (w) => Math.max(50, Math.min(600, Math.round(w)));

  const handleResize = (key) => (e, { size }) => {
    const nextWidth = clampColWidth(size.width);
    setCustomColumns((prev) => prev.map((col) => (col.key === key ? { ...col, width: nextWidth } : col)));
  };

  const handleResizeStop = (key) => (e, { size }) => {
    const nextWidth = clampColWidth(size.width);
    const saved = JSON.parse(localStorage.getItem(COLUMN_SETTING_STORAGE_KEY) || "{}");
    localStorage.setItem(COLUMN_SETTING_STORAGE_KEY, JSON.stringify({ ...saved, widths: { ...(saved.widths || {}), [key]: nextWidth } }));
  };

  useEffect(() => {
    const saved = localStorage.getItem(COLUMN_SETTING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const orderedKeys = Array.isArray(parsed.orderedKeys) ? parsed.orderedKeys : allColumns.map((c) => c.key);
        const savedVisibleKeys = Array.isArray(parsed.visibleKeys) ? parsed.visibleKeys : defaultVisibleKeys;
        const widths = parsed.widths || {};
        setVisibleKeys(savedVisibleKeys);
        const restored = orderedKeys
          .map((key) => allColumns.find((c) => c.key === key))
          .filter(Boolean)
          .filter((c) => savedVisibleKeys.includes(c.key))
          .map((c) => ({ ...c, width: widths?.[c.key] ?? c.width }));
        setCustomColumns(restored);
        return;
      } catch (e) {}
    }
    setCustomColumns(allColumns.filter((c) => defaultVisibleKeys.includes(c.key)));
  }, [allColumns]);

  const mergedColumns = useMemo(
    () =>
      customColumns
        .filter((col) => !(deviceIsMobile && col.key === "stt"))
        .map((col) => {
          const resolvedWidth = deviceIsMobile && col.key === "name" ? Math.max(col.width || 0, 140) : col.width;
          return {
            ...col,
            fixed: deviceIsMobile ? undefined : col.fixed,
            width: resolvedWidth,
            onHeaderCell: () => ({
              width: resolvedWidth,
              onResize: handleResize(col.key),
              onResizeStop: handleResizeStop(col.key),
            }),
          };
        }),
    [customColumns, deviceIsMobile]
  );

  const onCheckandCreate = async (forceEditMode = false) => {
    try {
      if (templateServices.find((t) => t.id == selectedPatientDiagnose.id_template_service)?.code.toUpperCase().includes("SASK")) {
        const sonoResult = await API_CALL.get(`/sono`, {
          params: { id_patient_diagnose: selectedPatientDiagnose.id },
        });
        if (sonoResult.data?.data?.data?.data?.length) {
          navigate(`/home/sono/bung/${sonoResult.data.data.data.data[0].id}`);
        } else {
          navigate(`/home/sono/use/patient-diagnose/${selectedPatientDiagnose.id}`);
        }
      } else {
        setInitEditMode(forceEditMode);
        setRightPanelMode("reading");
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
        width: "100%",
        maxWidth: "100%",
        overflowX: deviceIsMobile ? "hidden" : undefined,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: deviceIsMobile && selectedPatientDiagnose ? "none" : "block",
          padding: 0,
          width: !deviceIsMobile && selectedPatientDiagnose ? `${leftWidth}%` : "100%",
          flexShrink: 0,
        }}
      >
        <PatientDiagnoseFilterBar
          pendingFilters={pendingFilters}
          setPendingFilters={setPendingFilters}
          setPage={setPage}
          setOpenColumnModal={setOpenColumnModal}
          deviceIsMobile={deviceIsMobile}
        />

        <Divider style={{ margin: 0, marginBottom: 10 }} />
        <ConfigProvider theme={{ components: { Table: { fontSize: 11, cellPaddingBlock: 0 } } }}>
          <div style={{ position: "relative", overflowX: "auto", width: "100%" }}>
            <Table
              rowKey="id"
              size="small"
              rootClassName={styles.patientTable}
              components={{ header: { cell: ResizableTitle } }}
              columns={mergedColumns}
              dataSource={data}
              bordered
              scroll={{
                x: mergedColumns.reduce((total, col) => total + (col.width || 120), 0),
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
              rowClassName={(record) => (selectedPatientDiagnose?.id === record.id ? styles.selectedRow : "")}
              onRow={(record) => ({
                onClick: () => {
                  setRightPanelMode("detail");
                  setSelectedPatientDiagnose(record);
                },
                style: { cursor: "pointer" },
              })}
              onChange={(pagination, _filters, sorter) => {
                const nextSortBy = sorter?.field;
                const nextSortOrder = sorter?.order === "ascend" ? "ASC" : sorter?.order === "descend" ? "DESC" : undefined;
                setPendingFilters((prev) => ({ ...prev, sort_by: nextSortBy, sort_order: nextSortOrder }));
              }}
            />
          </div>
        </ConfigProvider>
      </div>

      {!deviceIsMobile && selectedPatientDiagnose && (
        <div
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsResizerHovered(true)}
          onMouseLeave={() => setIsResizerHovered(false)}
          style={{
            width: "8px",
            cursor: "col-resize",
            backgroundColor: isResizing || isResizerHovered ? "#3b82f6" : "#cbd5e1",
            transition: "background-color 0.15s ease",
            margin: "0 4px",
            borderRadius: "4px",
            zIndex: 10,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "2px",
              height: "20px",
              backgroundColor: isResizing || isResizerHovered ? "#ffffff" : "#64748b",
              borderRadius: "1px",
            }}
          />
        </div>
      )}

      <PatientDiagnoseRightPanel
        selectedPatientDiagnose={selectedPatientDiagnose}
        setSelectedPatientDiagnose={setSelectedPatientDiagnose}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        initEditMode={initEditMode}
        setInitEditMode={setInitEditMode}
        doctorUseFormVer3Id={doctorUseFormVer3Id}
        setDoctorUseFormVer3Id={setDoctorUseFormVer3Id}
        handleStatusChange={handleStatusChange}
        onCheckandCreate={onCheckandCreate}
        setOpenConsultationModal={setOpenConsultationModal}
        setTranslateOpen={setTranslateOpen}
        setOpenDicomModal={setOpenDicomModal}
        numberLanguageDoctorUseFormV3={numberLanguageDoctorUseFormV3}
        templateServices={templateServices}
        examParts={examParts}
        deviceIsMobile={deviceIsMobile}
        leftWidth={leftWidth}
      />

      <PatientDiagnoseModals
        openColumnModal={openColumnModal}
        setOpenColumnModal={setOpenColumnModal}
        allColumns={allColumns}
        visibleKeys={visibleKeys}
        columnSettingsStorageKey={COLUMN_SETTING_STORAGE_KEY}
        onSaveColumnSettings={handleSaveColumnSettings}
        openConsultationModal={openConsultationModal}
        setOpenConsultationModal={setOpenConsultationModal}
        onGoReading={() => setRightPanelMode("reading")}
        handleStatusChange={handleStatusChange}
        translateOpen={translateOpen}
        setTranslateOpen={setTranslateOpen}
        selectedPatientDiagnose={selectedPatientDiagnose}
        selectedDoctorUseFormVer3={selectedDoctorUseFormVer3}
        setLanguageTransslate={setLanguageTransslate}
        setSelectedDoctorUseFormVer3={setSelectedDoctorUseFormVer3}
        openDicomModal={openDicomModal}
        setOpenDicomModal={setOpenDicomModal}
        confirmState={confirmState}
      />
    </div>
  );
};

export default PatientTablePage;
