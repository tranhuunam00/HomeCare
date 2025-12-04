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
import { PATIENT_DIAGNOSE_STATUS_CODE, USER_ROLE } from "../../constant/app";
import { toast } from "react-toastify";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const { Option } = Select;

const DATE_OPTIONS = [
  { label: "Hôm nay", value: "today" },
  { label: "Hôm qua", value: "yesterday" },
  { label: "Tuần này", value: "this_week" },
  { label: "Tháng này", value: "this_month" },
  { label: "Range", value: "range" },
  { label: "Tất cả", value: "all" },
];

const PATIENT_DIAGNOSE_STATUS = {
  1: "Mới",
  2: "Đang đọc",
  3: "Chờ xác nhận",
  4: "Đã xác nhận",
};

const PATIENT_DIAGNOSE_COLOR = {
  1: "#0b56e3d3", // New
  2: "#F59E0B", // Reading
  3: "#EF4444", // Waiting
  4: "#10B981", // Done
};

const defaultVisibleKeys = [
  "STT",
  "id",
  "name",
  "id_template_service",
  "PID",
  "SID",
  "status",
  "action",
];

const STORAGE_KEY = "visibleColumns_patientDiagnose";

const PatientTablePage = ({ isNotCreate = false, PID = null }) => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [visibleKeys, setVisibleKeys] = useState([]);
  const { user, doctor, examParts, templateServices } = useGlobalAuth();
  const [clinics, setClinics] = useState([]);

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
    fetchPatients();
  }, [filters, page, limit]);

  const allColumns = useMemo(
    () => [
      {
        title: "STT",
        key: "index",
        align: "center",
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
      },
      {
        title: "Họ tên",
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (text) => text?.toUpperCase(),
      },
      { title: "PID", dataIndex: "PID", key: "PID", width: 120 },
      { title: "SID", dataIndex: "SID", key: "SID", width: 120 },
      {
        width: 220,
        title: "Chỉ định",
        dataIndex: "id_template_service",
        key: "id_template_service",
        render: (val) => templateServices?.find((t) => t.id == val)?.name,
      },

      {
        width: 220,
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
        render: (val) => clinics?.find((t) => t.id == val)?.name,
      },
      { title: "Giới tính", dataIndex: "gender", key: "gender", width: 120 },
      { title: "CCCD", dataIndex: "CCCD", key: "CCCD", width: 160 },
      {
        title: "SĐT",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 140,
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
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status) => (
          <Tag color={PATIENT_DIAGNOSE_COLOR[status]}>
            {PATIENT_DIAGNOSE_STATUS[status]}
          </Tag>
        ),
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
        title: "Mã phòng khám",
        dataIndex: "id_clinic",
        key: "id_clinic",
        width: 120,
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
    [user]
  );

  const fetchClinics = async () => {
    try {
      const res = await API_CALL.get("/clinics", {
        params: { page: 1, limit: 100 },
      });
      setClinics(res.data.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setVisibleKeys(saved ? JSON.parse(saved) : defaultVisibleKeys);
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [filters, page, limit]);

  const cleanParams = (obj) => {
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

  const fetchPatients = async () => {
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

  const columnsToRender = useMemo(
    () => allColumns.filter((col) => visibleKeys.includes(col.key)),
    [visibleKeys, allColumns]
  );

  const columnMenu = (
    <div style={{ padding: 12, maxHeight: 300, overflowY: "auto" }}>
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Chọn cột hiển thị
      </Typography.Text>
      {allColumns.map((col) => (
        <div
          key={col.key}
          style={{ padding: "4px 0", backgroundColor: "white" }}
        >
          <Checkbox
            checked={visibleKeys.includes(col.key)}
            onChange={() => toggleColumn(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ margin: "8px 0" }} />
      <Button
        size="small"
        onClick={() => {
          setVisibleKeys(defaultVisibleKeys);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisibleKeys));
        }}
      >
        Khôi phục mặc định
      </Button>
    </div>
  );

  return (
    <div style={{ padding: 0 }}>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography.Title level={4}>WORK LIST</Typography.Title>
        <Space>
          <Dropdown overlay={columnMenu} trigger={["click"]}>
            <Button icon={<SettingOutlined />}>Chọn cột</Button>
          </Dropdown>
          {!isNotCreate && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => navigate("/home/patients-diagnose/create")}
            >
              Thêm mới
            </Button>
          )}
        </Space>
      </Space>

      <Row style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              setFilters(pendingFilters);
            }}
          >
            Tìm kiếm
          </Button>

          <Button
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

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên"
            onChange={(e) =>
              setPendingFilters({ ...pendingFilters, name: e.target.value })
            }
            allowClear
          />
        </Col>

        <Col span={8}>
          <Input
            placeholder="Tìm theo PID"
            onChange={(e) =>
              setPendingFilters({ ...pendingFilters, PID: e.target.value })
            }
            allowClear
          />
        </Col>

        <Col span={8}>
          <Input
            placeholder="Tìm theo SID"
            onChange={(e) =>
              setPendingFilters({ ...pendingFilters, SID: e.target.value })
            }
            allowClear
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder="Chọn phòng khám"
            optionFilterProp="children"
            onChange={(value) =>
              setPendingFilters({ ...pendingFilters, id_clinic: value })
            }
          >
            {clinics?.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col span={8}>
          <Select
            allowClear
            style={{ width: "100%" }}
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

        <Col span={8}>
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
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space wrap>
            <h3>Trạng thái:</h3>
            {Object.entries(PATIENT_DIAGNOSE_STATUS).map(([key, label]) => {
              const intKey = Number(key);
              const isActive = pendingFilters.status?.includes(intKey);

              return (
                <Button
                  key={key}
                  style={{
                    backgroundColor: PATIENT_DIAGNOSE_COLOR[intKey],
                    color: "white",
                    opacity: isActive ? 1 : 0.4,
                  }}
                  onClick={() => {
                    const current = pendingFilters.status || [];
                    const newStatus = isActive
                      ? current.filter((x) => x !== intKey)
                      : [...current, intKey];

                    setPendingFilters({ ...pendingFilters, status: newStatus });
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Space>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space wrap>
            <h3>Thời gian:</h3>

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

        {/* Hiện RangePicker nếu chọn RANGE */}
      </Row>

      <Divider />

      <h3>Tổng cộng: {total} ca bệnh được lọc</h3>

      <Table
        rowKey="id"
        columns={columnsToRender}
        dataSource={data}
        bordered
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/home/patients-diagnose/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default PatientTablePage;
