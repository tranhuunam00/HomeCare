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
} from "antd";
import { SettingOutlined, UserAddOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

// ==========================
// Trạng thái & màu hiển thị
// ==========================
const PATIENT_DIAGNOSE_STATUS = {
  1: "Mới",
  2: "Đang đọc",
  3: "Chờ xác nhận",
  4: "Đã xác nhận",
};

const PATIENT_DIAGNOSE_COLOR = {
  1: "blue",
  2: "yellow",
  3: "orange",
  4: "green",
};

// ==========================
// Dữ liệu giả
// ==========================
const fakePatients = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    pid: "123456",
    sid: "SID001",
    status: 1,
    email: "a@gmail.com",
    phone: "0901234567",
    cccd: "012345678901",
    country: "Việt Nam",
    detail: "Số 1, Đường A, Quận B",
  },
  {
    id: 2,
    name: "Trần Thị B",
    pid: "654321",
    sid: "SID002",
    status: 3,
    email: "b@gmail.com",
    phone: "0907654321",
    cccd: "012345678902",
    country: "Hoa Kỳ",
    detail: "Số 2, Đường C, Quận D",
  },
];

// ==========================
// Cột bảng
// ==========================
const allColumns = [
  { title: "ID", dataIndex: "id", key: "id", fixed: "left", width: 80 },
  { title: "Họ tên", dataIndex: "name", key: "name", width: 200 },
  { title: "PID", dataIndex: "pid", key: "pid", width: 120 },
  { title: "SID", dataIndex: "sid", key: "sid", width: 120 },
  { title: "Chỉ định", dataIndex: "indication", key: "indication", width: 200 },
  { title: "Giới tính", dataIndex: "gender", key: "gender", width: 120 },
  { title: "CCCD", dataIndex: "cccd", key: "cccd", width: 160 },
  { title: "SĐT", dataIndex: "phoneNumber", key: "phoneNumber", width: 140 },
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
    title: "Quận/Huyện",
    dataIndex: "district_code",
    key: "district_code",
    width: 140,
  },
  { title: "Phường/Xã", dataIndex: "ward_code", key: "ward_code", width: 140 },
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
  { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", width: 180 },
  {
    title: "Ngày cập nhật",
    dataIndex: "updatedAt",
    key: "updatedAt",
    width: 180,
  },
  { title: "Xoá lúc", dataIndex: "deletedAt", key: "deletedAt", width: 180 },
  {
    title: "Mã phòng khám",
    dataIndex: "id_clinic",
    key: "id_clinic",
    width: 120,
  },
  { title: "Người tạo", dataIndex: "createdBy", key: "createdBy", width: 120 },
];

const defaultVisibleKeys = ["id", "name", "pid", "sid", "status"];

const PatientTablePage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [visibleKeys, setVisibleKeys] = useState(defaultVisibleKeys);
  const [filters, setFilters] = useState({
    name: "",
    pid: "",
    sid: "",
    statuses: [],
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setData(fakePatients);
  };

  const handleColumnToggle = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const resetColumns = () => {
    setVisibleKeys(defaultVisibleKeys);
  };

  const columnsToRender = allColumns.filter((col) =>
    visibleKeys.includes(col.key)
  );

  const columnMenu = (
    <div style={{ padding: 12, maxHeight: 300, overflowY: "auto" }}>
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Chọn cột hiển thị
      </Typography.Text>
      {allColumns.map((col) => (
        <div key={col.key} style={{ padding: "4px 0" }}>
          <Checkbox
            checked={visibleKeys.includes(col.key)}
            onChange={() => handleColumnToggle(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
      <Divider style={{ margin: "8px 0" }} />
      <Button size="small" onClick={resetColumns}>
        Khôi phục mặc định
      </Button>
    </div>
  );

  const handleFilterChange = useMemo(
    () =>
      debounce((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }, 300),
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const pidMatch = item.pid
        .toLowerCase()
        .includes(filters.pid.toLowerCase());
      const sidMatch = item.sid
        .toLowerCase()
        .includes(filters.sid.toLowerCase());
      const statusMatch =
        filters.statuses.length === 0 || filters.statuses.includes(item.status);
      return nameMatch && pidMatch && sidMatch && statusMatch;
    });
  }, [data, filters]);

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography.Title level={4}>Danh sách ca chẩn đoán</Typography.Title>
        <Dropdown
          overlay={columnMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button icon={<SettingOutlined />}>Chọn cột</Button>
        </Dropdown>
        <Button
          onClick={() => navigate("create")}
          type="primary"
          icon={<UserAddOutlined />}
        >
          Thêm mới
        </Button>
      </Space>

      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm theo tên"
            onChange={(e) => handleFilterChange("name", e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Tìm theo PID"
            onChange={(e) => handleFilterChange("pid", e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Tìm theo SID"
            onChange={(e) => handleFilterChange("sid", e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Lọc theo trạng thái"
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, statuses: value }))
            }
            value={filters.statuses}
          >
            {Object.entries(PATIENT_DIAGNOSE_STATUS).map(([key, label]) => (
              <Option key={key} value={parseInt(key)}>
                {label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        rowKey="id"
        columns={columnsToRender}
        dataSource={filteredData}
        bordered
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default PatientTablePage;
