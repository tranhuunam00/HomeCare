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
import API_CALL from "../../services/axiosClient";

const { Option } = Select;

// ==== Trạng thái bệnh án ====
const PATIENT_DIAGNOSE_STATUS = {
  1: "Mới",
  2: "Đang đọc",
  3: "Chờ xác nhận",
  4: "Đã xác nhận",
};

const PATIENT_DIAGNOSE_COLOR = {
  1: "blue",
  2: "gold",
  3: "orange",
  4: "green",
};

// ==== Cấu hình cột bảng ====
const allColumns = [
  { title: "ID", dataIndex: "id", key: "id", fixed: "left", width: 80 },
  { title: "Họ tên", dataIndex: "name", key: "name", width: 200 },
  { title: "PID", dataIndex: "PID", key: "PID", width: 120 },
  { title: "SID", dataIndex: "SID", key: "SID", width: 120 },
  { title: "Chỉ định", dataIndex: "Indication", key: "Indication", width: 200 },
  { title: "Giới tính", dataIndex: "gender", key: "gender", width: 120 },
  { title: "CCCD", dataIndex: "CCCD", key: "CCCD", width: 160 },
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
  {
    title: "Mã phòng khám",
    dataIndex: "id_clinic",
    key: "id_clinic",
    width: 120,
  },
  { title: "Người tạo", dataIndex: "createdBy", key: "createdBy", width: 120 },
];

const defaultVisibleKeys = ["id", "name", "PID", "SID", "status"];

const PatientTablePage = ({ isNotCreate = false, PID = null }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleKeys, setVisibleKeys] = useState(defaultVisibleKeys);
  const [filters, setFilters] = useState({
    name: null,
    PID: PID,
    SID: null,
    id_clinic: null,
    statuses: [],
  });

  useEffect(() => {
    fetchPatients();
  }, [filters, page, limit]);

  const fetchPatients = async () => {
    try {
      const res = await API_CALL.get("/patient-diagnose", {
        params: {
          name: filters.name,
          PID: filters.PID,
          SID: filters.SID,
          id_clinic: filters.id_clinic,
          status: filters.statuses,
          page,
          limit,
        },
      });
      setData(res.data.data.rows);
      setTotal(res.data.data.count);
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
    }
  };

  const handleFilterChange = useMemo(
    () =>
      debounce((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // reset page khi filter
      }, 300),
    []
  );

  const handleColumnToggle = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const resetColumns = () => setVisibleKeys(defaultVisibleKeys);

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
        <Space>
          <Dropdown
            overlay={columnMenu}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button icon={<SettingOutlined />}>Chọn cột</Button>
          </Dropdown>
          {!isNotCreate && (
            <Button
              onClick={() => navigate("create")}
              type="primary"
              icon={<UserAddOutlined />}
            >
              Thêm mới
            </Button>
          )}
        </Space>
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
            onChange={(e) => handleFilterChange("PID", e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Tìm theo SID"
            onChange={(e) => handleFilterChange("SID", e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="ID phòng khám"
            onChange={(e) => handleFilterChange("id_clinic", e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
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

      <h3>Tổng cộng: {total || 0} bản ghi</h3>

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
