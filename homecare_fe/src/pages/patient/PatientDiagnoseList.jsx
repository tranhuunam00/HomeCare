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
} from "antd";
import {
  SettingOutlined,
  UserAddOutlined,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
  ApartmentOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import {
  PATIENT_DIAGNOSE_COLOR,
  PATIENT_DIAGNOSE_STATUS,
  PATIENT_DIAGNOSE_STATUS_CODE,
  USER_ROLE,
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
import { stepsStatus } from "../formver3/formver3.constant";
import ConsultationSelectModal from "../formver3/components/ConsultationSelectModal/ConsultationSelectModal";
import CustomSteps from "../../components/CustomSteps/CustomSteps";
import {
  getProvinceNameByCode,
  getWardNameByCode,
} from "../../hooks/useVietnamAddress";

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

const PatientTablePage = ({ PID = null }) => {
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
  } = useGlobalAuth();

  const { fetchTSAndExamParts } = useTemplateServicesAndExamParts();

  useEffect(() => {
    if (!socket) return;

    const handlePatientUpdated = (payload) => {
      const updatedRecord = payload?.data || payload;

      if (!updatedRecord?.id) return;

      setSelectedPatientDiagnose(updatedRecord);

      console.log("updatedRecord", updatedRecord);

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
        width: 100,
        render: (status) => (
          <Tag style={{ width: 80 }} color={PATIENT_DIAGNOSE_COLOR[status]}>
            {PATIENT_DIAGNOSE_STATUS[status]}
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
                icon={<EditOutlined />} // 👉 Nút cập nhật
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
    (index) =>
    (e, { size }) => {
      setCustomColumns((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          width: size.width,
        };

        // lưu width vào localStorage
        const saved = JSON.parse(
          localStorage.getItem(COLUMN_SETTING_STORAGE_KEY) || "{}",
        );

        localStorage.setItem(
          COLUMN_SETTING_STORAGE_KEY,
          JSON.stringify({
            ...saved,
            widths: {
              ...(saved.widths || {}),
              [next[index].key]: size.width,
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
      customColumns.map((col, index) => ({
        ...col,
        onHeaderCell: () => ({
          width: col.width,
          onResize: handleResize(index),
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: !deviceIsMobile ? "row" : "column",
        gap: 8,
      }}
    >
      <div
        style={{
          padding: 0,
          flex: 1,
          width: !deviceIsMobile ? 200 : "100%",
        }}
      >
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col span={1}>
            <Tooltip title={"Cấu hình cột"}>
              <Button
                onClick={() => setOpenColumnModal(true)}
                icon={<SettingOutlined />}
              ></Button>
            </Tooltip>
          </Col>

          <Col span={4} style={{ marginBottom: 5 }}>
            <Input
              placeholder="Tên"
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, name: e.target.value })
              }
              allowClear
              value={pendingFilters?.name}
            />
          </Col>

          <Col span={4} style={{ marginBottom: 5 }}>
            <Input
              placeholder="Tìm theo PID"
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, PID: e.target.value })
              }
              allowClear
              value={pendingFilters?.PID}
            />
          </Col>

          <Col span={15}>
            <Space
              wrap
              style={{
                width: "100%",
                justifyContent: deviceIsMobile ? "space-between" : "flex-start",
              }}
            >
              {DATE_OPTIONS.map(({ label, value }) => {
                const isActive = pendingFilters.date_type === value;
                return (
                  <Button
                    key={value}
                    type={isActive ? "primary" : "default"}
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
                    style={{ width: deviceIsMobile ? 100 : "auto" }}
                  >
                    {label}
                  </Button>
                );
              })}
              {pendingFilters.date_type === "range" && (
                <RangePicker
                  style={{ width: "100%" }}
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
            </Space>
          </Col>
        </Row>

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
              scroll={{ x: 1200, y: 800 }}
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
            <Divider style={{ margin: "12px 0" }} />

            <Typography.Text strong style={{ color: "#cf1322" }}>
              Các kết quả quả khác của {selectedPatientDiagnose?.name}: (
              {sameCCCDData.length}) bản ghi
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
                columns={tableColumns}
                dataSource={sameCCCDData}
                bordered
                pagination={false}
                scroll={{ x: 1200 }}
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
              borderBottom: "1px solid #3950d163",
              boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
              alignItems: "center",
            }}
          >
            <h5>Ngôn ngữ dùng: {numberLanguageDoctorUseFormV3}</h5>
            <CustomSteps
              steps={stepsStatus({
                setOpenConsultationModal,
                onCheckandCreate,
              })}
              current={stepsStatus({
                setOpenConsultationModal,
                onCheckandCreate,
              }).findIndex((s) => s.key === selectedPatientDiagnose.status)}
              is_consultation_doctor={
                selectedPatientDiagnose.id_consulting_doctor
              }
            />
          </div>
          <div>
            {rightPanelMode === "detail" ? (
              <PatientDiagnoiseDetailPage
                idFromList={selectedPatientDiagnose?.id}
                onOpenReading={() => setRightPanelMode("reading")}
                onClose={() => setSelectedPatientDiagnose(null)}
                setDoctorUseFormVer3Id={setDoctorUseFormVer3Id}
              />
            ) : (
              <DoctorUseDFormVer3
                patient_diagnose_id={selectedPatientDiagnose?.id}
                isUse={true}
                onBackDetail={() => setRightPanelMode("detail")}
                doctorUseFormVer3Id={doctorUseFormVer3Id}
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
      />
    </div>
  );
};

export default PatientTablePage;
