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
} from "antd";
import {
  SettingOutlined,
  UserAddOutlined,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";
import {
  getAge,
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

const { Option } = Select;

const DATE_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Hôm nay", value: "today" },
  { label: "Hôm qua", value: "yesterday" },
  { label: "Tuần này", value: "this_week" },
  { label: "Tháng này", value: "this_month" },
  { label: "Range", value: "range" },
];

const PATIENT_DIAGNOSE_STATUS = {
  1: "Chưa đọc",
  2: "Đang đọc",
  3: "Chờ duyệt",
  4: "Đã duyệt",
};

const PATIENT_DIAGNOSE_STATUS_FILTER = {
  1: "Chưa đọc",
  2: "Đang đọc",
  3: "Chờ duyệt",
  4: "Đã duyệt",
};

const PATIENT_DIAGNOSE_COLOR = {
  1: "#0b56e3d3", // New
  2: "#F59E0B", // Reading
  3: "#8317c6ff", // Waiting
  4: "#10B981", // Done
};

const defaultVisibleKeys = [
  "STT",
  "id",
  "name",
  "status",
  "dob",
  "gender",
  "Indication",
];

const STORAGE_KEY = "visibleColumns_patientDiagnose";

const PatientTablePage = ({ isNotCreate = false, PID = null }) => {
  const navigate = useNavigate();
  const { useBreakpoint } = Grid;

  const screens = useBreakpoint();

  const deviceIsMobile = !screens.md;

  const [data, setData] = useState([]);
  const [sameCCCDData, setSameCCCDData] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [customColumns, setCustomColumns] = useState([]);
  const [chosenRecord, setChosenRecord] = useState();
  const [returnStatus, setReturnStatus] = useState(false);

  const [visibleKeys, setVisibleKeys] = useState([]);
  const {
    user,
    doctor,
    examParts,
    templateServices,
    clinicsAll,
    isOnWorkList,
    setIsOnWorkList,
    setCollapsed,
  } = useGlobalAuth();

  useEffect(() => {
    setIsOnWorkList(true);
    setCollapsed(true);
    return () => setIsOnWorkList(false);
  }, []);

  const [pendingFilters, setPendingFilters] = useState({
    name: null,
    PID: PID,
    SID: null,
    id_clinic: null,
    status: [],
    id_template_service: null,
    date_type: null,
    from_date: null,
    to_date: null,
  });

  const [filters, setFilters] = useState({
    PID: PID,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setFilters(pendingFilters);
    }, 500); // ⏱ 300–500ms là hợp lý

    return () => clearTimeout(handler);
  }, [pendingFilters]);

  useEffect(() => {
    fetchPatients();
  }, [filters, page, limit]);

  const allColumns = useMemo(
    () => [
      {
        title: "STT",
        key: "STT",

        align: "right", // ✅ CĂN BÊN PHẢI

        width: 70,
        render: (_, __, index) => (page - 1) * 10 + index + 1,
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        fixed: "left",
        width: 80,
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
        render: (text, record) => {
          const nameUpdated =
            record.sono_results?.[0]?.benh_nhan_ho_ten ||
            record.doctor_use_form_ver2s?.[0]?.benh_nhan_ho_ten;
          const displayName = nameUpdated || text;
          return displayName ? displayName.toUpperCase() : "-";
        },
      },

      {
        title: "Tuổi",
        dataIndex: "dob",
        key: "dob",
        width: 80,
        align: "right", // ✅ CĂN BÊN PHẢI
        render: (val, record) => {
          const ageUpdated =
            record.sono_results?.[0]?.benh_nhan_tuoi ||
            record.doctor_use_form_ver2s?.[0]?.benh_nhan_tuoi;
          if (ageUpdated !== undefined && ageUpdated !== null) {
            return <span>{ageUpdated}</span>;
          }
          return val ? getAge(val) : "-";
        },
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        width: 80,
        render: (text, record) => {
          const genderUpdated =
            record.sono_results?.[0]?.benh_nhan_gioi_tinh ||
            record.doctor_use_form_ver2s?.[0]?.benh_nhan_gioi_tinh;
          return genderUpdated || text || "-";
        },
      },
      {
        title: "Lâm sàng",
        dataIndex: "Indication",
        key: "Indication",
        width: 120,
        render: (text, record) => {
          const clinicalUpdated =
            record.sono_results?.[0]?.benh_nhan_lam_sang ||
            record.doctor_use_form_ver2s?.[0]?.benh_nhan_lam_sang;
          const displayValue = clinicalUpdated || text;

          const limit = 20;
          const isOverLimit = displayValue.length > limit;
          const truncatedText = isOverLimit
            ? `${displayValue.substring(0, limit)}...`
            : displayValue;
          return <div>{truncatedText || "-"}</div>;
        },
      },

      {
        width: 170,
        title: "Chỉ định",
        dataIndex: "id_template_service",
        key: "id_template_service",
        render: (val) => templateServices?.find((t) => t.id == val)?.name,
        sorter: true,
      },

      { title: "CCCD", dataIndex: "CCCD", key: "CCCD", width: 160 },
      { title: "PID", dataIndex: "PID", key: "PID", width: 120 },
      { title: "SID", dataIndex: "SID", key: "SID", width: 120 },
      {
        title: "SĐT",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 140,
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
        width: 140,
      },
      {
        title: "Phường/Xã",
        dataIndex: "ward_code",
        key: "ward_code",
        width: 140,
      },

      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
      },
      {
        title: "Ngày cập nhật",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
      },

      {
        title: "Người tạo",
        dataIndex: "createdBy",
        key: "createdBy",
        width: 120,
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
    [user, clinicsAll, examParts, templateServices, page]
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
  }, []);

  useEffect(() => {
    fetchPatients(filters);
  }, [filters, page, limit, returnStatus]);

  useEffect(() => {
    if (chosenRecord) fetchPatientsByChosen();
  }, [chosenRecord, returnStatus]);

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
        params: { ...cleanParams(filters), page, limit },
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
      if (!chosenRecord?.CCCD && !chosenRecord?.PID) {
        setSameCCCDData([]);
        return;
      }
      const res = chosenRecord?.CCCD
        ? await API_CALL.get("/patient-diagnose", {
            params: { CCCD: chosenRecord?.CCCD, page: 1, limit: 10 },
          })
        : await API_CALL.get("/patient-diagnose", {
            params: { PID: chosenRecord?.PID, page: 1, limit: 10 },
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

  const toggleColumn = (key) => {
    const updated = visibleKeys.includes(key)
      ? visibleKeys.filter((k) => k !== key)
      : [...visibleKeys, key];
    setVisibleKeys(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  useEffect(() => {
    const cols = allColumns
      .filter((c) => visibleKeys.includes(c.key))
      .map((c) => ({ ...c }));
    setCustomColumns(cols);
  }, [visibleKeys, allColumns]);

  const columnsToRender = useMemo(
    () => allColumns.filter((col) => visibleKeys.includes(col.key)),
    [visibleKeys, allColumns]
  );

  const handleSaveColumnSettings = ({
    orderedKeys,
    visibleKeys: newVisibleKeys,
    widths,
  }) => {
    setVisibleKeys(newVisibleKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibleKeys));

    const reOrderedColumns = orderedKeys.map((key) =>
      allColumns.find((c) => c.key === key)
    );

    const finalColumns = reOrderedColumns
      .filter((key) => newVisibleKeys.includes(key))
      .map((col) => ({
        ...col,
        width: widths[col.key] || col.width,
      }));

    setCustomColumns(finalColumns);
  };

  const tableColumns =
    customColumns.length > 0 ? customColumns : columnsToRender;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: !deviceIsMobile ? "row" : "column",
        gap: 8,
      }}
    >
      <div style={{ width: !deviceIsMobile ? 175 : "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: 16,
          }}
        >
          <Typography.Title
            level={4}
            style={{ margin: 0, whiteSpace: "nowrap" }}
          >
            Số Ca = {total}
          </Typography.Title>

          <Space style={{ justifyContent: "space-around", display: "flex" }}>
            {!isNotCreate && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate("/home/patients-diagnose/create")}
              >
                Thêm mới
              </Button>
            )}
            <Button
              onClick={() => setOpenColumnModal(true)}
              icon={<SettingOutlined />}
            ></Button>
          </Space>
        </div>

        <Divider
          style={{ margin: 16, display: deviceIsMobile ? "none" : "block" }}
        />

        <Divider
          style={{ margin: 16, display: deviceIsMobile ? "none" : "block" }}
        />
        <div
          style={{
            display: deviceIsMobile ? "flex" : "block",
            justifyContent: "end",
            gap: "12px",
          }}
        >
          <Row style={{ marginBottom: !deviceIsMobile ? 16 : 0, order: 1 }}>
            <Space>
              <Button
                style={{ width: !deviceIsMobile ? 175 : "100%" }}
                onClick={() => {
                  setPendingFilters({
                    name: null,
                    PID: PID,
                    SID: null,
                    id_clinic: null,
                    status: [],
                    id_template_service: null,
                    date_type: null,
                    from_date: null,
                    to_date: null,
                  });
                  setFilters({});
                  setPage(1);
                }}
              >
                Xóa lọc
              </Button>
            </Space>
          </Row>
          <Divider
            style={{ margin: 16, display: deviceIsMobile ? "none" : "block" }}
          />
          <ConfigProvider
            theme={{
              components: {
                Select: {
                  fontSize: 13,
                },
              },
            }}
          >
            <Col>
              <Select
                className="smallSelect"
                allowClear
                showSearch
                placeholder="Chọn phòng khám"
                style={{ width: deviceIsMobile ? 250 : 175 }}
                optionFilterProp="children"
                onChange={(value) =>
                  setPendingFilters({ ...pendingFilters, id_clinic: value })
                }
              >
                {clinicsAll?.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </ConfigProvider>
        </div>

        <Divider
          style={{ margin: 16, display: deviceIsMobile ? "none" : "block" }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: !deviceIsMobile ? "column" : "row",
            width: "100%",
            gap: 8,
            marginTop: deviceIsMobile ? 8 : 0,
          }}
        >
          <Col style={{ flex: 1 }}>
            <Select
              allowClear
              style={{ width: "100%", maxWidth: 175 }}
              placeholder="Chỉ định"
              onChange={(value) =>
                setPendingFilters({
                  ...pendingFilters,
                  id_template_service: value,
                })
              }
            >
              {templateServices?.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Divider
            style={{ margin: 8, display: deviceIsMobile ? "none" : "block" }}
          />

          <Col style={{ flex: 1 }}>
            <Select
              allowClear
              disabled={!pendingFilters.id_template_service}
              style={{ width: "100%" }}
              placeholder="Bộ phận"
              onChange={(value) =>
                setPendingFilters({ ...pendingFilters, id_exam_part: value })
              }
            >
              {examParts
                ?.filter(
                  (e) =>
                    e.id_template_service == pendingFilters.id_template_service
                )
                ?.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
            </Select>
          </Col>
        </div>

        <Divider style={{ margin: 8 }} />

        <Col span={24}>
          <div style={{ width: "100%" }}>
            <h4 style={{ display: deviceIsMobile ? "none" : "block" }}>
              Trạng thái:
            </h4>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                width: "100%",
              }}
            >
              {Object.entries(PATIENT_DIAGNOSE_STATUS_FILTER).map(
                ([key, label]) => {
                  const intKey = Number(key);
                  const isChecked = pendingFilters.status?.includes(intKey);

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        const current = pendingFilters.status || [];
                        const newStatus = isChecked
                          ? current.filter((x) => x !== intKey)
                          : [...current, intKey];

                        setPendingFilters({
                          ...pendingFilters,
                          status: newStatus,
                        });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        backgroundColor: PATIENT_DIAGNOSE_COLOR[intKey],
                        color: "#fff",
                        opacity: isChecked ? 1 : 0.4,
                        borderRadius: 6,
                        padding: "8px 10px",
                        cursor: "pointer",
                        width: !deviceIsMobile ? "100%" : "calc(50% - 4px)",
                        minWidth: !deviceIsMobile ? 175 : "unset",
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ pointerEvents: "none" }} // click cả khối
                      />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {label}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Col>
      </div>

      <div
        style={{
          padding: 0,
          flex: 1,
          width: !deviceIsMobile ? 200 : "100%",
        }}
      >
        <Space
          style={{
            marginBottom: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* <Space></Space> */}
        </Space>

        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col
            span={chosenRecord || deviceIsMobile ? 12 : 5}
            style={{ marginBottom: 5 }}
          >
            <Input
              placeholder="Tìm theo tên"
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, name: e.target.value })
              }
              allowClear
            />
          </Col>

          <Col
            span={chosenRecord || deviceIsMobile ? 12 : 5}
            style={{ marginBottom: 5 }}
          >
            <Input
              placeholder="Tìm theo PID"
              onChange={(e) =>
                setPendingFilters({ ...pendingFilters, PID: e.target.value })
              }
              allowClear
            />
          </Col>
          <Col span={chosenRecord || deviceIsMobile ? 24 : 14}>
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
              padding: 0,
              flex: 1,
              overflowX: "hide",
              maxWidth: "100%", //
            }}
          >
            <Table
              rowKey="id"
              size="small"
              rootClassName={styles.patientTable}
              columns={
                customColumns.length > 0 ? customColumns : columnsToRender
              }
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
              onChange={(pagination, _filters, sorter) => {
                // ✅ 1. Pagination luôn xử lý
                if (
                  pagination.current !== page ||
                  pagination.pageSize !== limit
                ) {
                  setPage(pagination.current);
                  setLimit(pagination.pageSize);
                }

                // ✅ 2. Sort
                if (sorter?.order) {
                  setFilters((prev) => {
                    const newSortBy = sorter.field;
                    const newSortOrder =
                      sorter.order === "ascend" ? "asc" : "desc";

                    // ✅ CHỈ reset page khi sort thay đổi
                    if (
                      prev.sort_by !== newSortBy ||
                      prev.sort_order !== newSortOrder
                    ) {
                      setPage(1);
                    }

                    return {
                      ...prev,
                      sort_by: newSortBy,
                      sort_order: newSortOrder,
                    };
                  });
                } else {
                  // ✅ Khi clear sort
                  setFilters((prev) => {
                    if (prev.sort_by || prev.sort_order) {
                      setPage(1); // clear sort cũng reset page
                    }
                    const { sort_by, sort_order, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              onRow={(record) => ({
                onClick: () => {
                  !deviceIsMobile
                    ? setChosenRecord(record)
                    : navigate(`/home/patients-diagnose/${record.id}`, {
                        state: { record },
                      });
                },
                style: { cursor: "pointer" },
              })}
            />
          </div>
        </ConfigProvider>
        {sameCCCDData.length > 0 && (
          <>
            <Divider style={{ margin: "12px 0" }} />

            <Typography.Text strong style={{ color: "#cf1322" }}>
              Các ca có cùng CCCD hoặc PID ({sameCCCDData.length})
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
                      ? setChosenRecord(record)
                      : navigate(`/home/patients-diagnose/${record.id}`);
                  },
                  style: { cursor: "pointer", background: "#fafafa" },
                })}
              />
            </ConfigProvider>
          </>
        )}
      </div>
      {chosenRecord && (
        <div style={{ padding: 0, flex: 1, width: 200 }}>
          <PatientDiagnoiseDetailPage
            idFromList={+chosenRecord?.id}
            onStatusChange={() => setReturnStatus((prev) => !prev)}
          />
        </div>
      )}

      <ColumnSettingModal
        open={openColumnModal}
        onClose={() => setOpenColumnModal(false)}
        allColumns={allColumns}
        visibleKeys={visibleKeys}
        onSave={handleSaveColumnSettings}
      />
    </div>
  );
};

export default PatientTablePage;
