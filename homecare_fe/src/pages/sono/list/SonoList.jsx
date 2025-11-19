// ... các import giữ nguyên
import React, { useEffect, useState } from "react";
import { Table, Input, Select, Row, Col, Card, Button, Spin } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import styles from "./SonoList.module.scss"; // dùng lại css list
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_CALL from "../../../services/axiosClient";
import { SONO_STATUS } from "../details/bung/sono.bung";

const { Option } = Select;

const SonoList = () => {
  const navigate = useNavigate();

  // Dữ liệu
  const [data, setData] = useState([]);

  // Loading + phân trang
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Bộ lọc thật
  const [filters, setFilters] = useState({
    benh_nhan_ho_ten: "",
    benh_nhan_pid: "",
    benh_nhan_sid: "",
    status: null,
  });

  const [pendingFilters, setPendingFilters] = useState({
    benh_nhan_ho_ten: "",
    benh_nhan_pid: "",
    benh_nhan_sid: "",
    status: null,
  });
  // ================================
  // FETCH SONO LIST
  // ================================
  const fetchSono = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };

      if (filters.benh_nhan_ho_ten)
        params.benh_nhan_ho_ten = filters.benh_nhan_ho_ten;

      if (filters.benh_nhan_pid) params.benh_nhan_pid = filters.benh_nhan_pid;

      if (filters.benh_nhan_sid) params.benh_nhan_sid = filters.benh_nhan_sid;
      if (filters.status !== null) params.status = filters.status;

      const res = await API_CALL.get("/sono", { params });

      setData(res.data.data.data.data);
      setTotal(res.data.data.data.total);
    } catch (err) {
      toast.error("Không tải được Danh sách SONO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSono();
  }, [page, filters]);

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      align: "center",
    },
    {
      title: "Họ tên bệnh nhân",
      dataIndex: "benh_nhan_ho_ten",
    },
    {
      title: "Bác sĩ chỉ định",
      key: "doctor_name",
      render: (_, record) => record?.id_doctor_doctor?.full_name || "—",
    },
    {
      title: "Giới tính",
      dataIndex: "benh_nhan_gioi_tinh",
    },
    {
      title: "SĐT",
      dataIndex: "benh_nhan_dien_thoai",
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <span style={{ color: status === "approved" ? "green" : "orange" }}>
          {status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => navigate(`/home/sono/bung/${record.id}`)}
        >
          Xem / Chỉnh sửa
        </Button>
      ),
    },
  ];

  // ================================
  // UI
  // ================================
  return (
    <div className={styles.CustomerList}>
      <div className={styles.titleBar}>
        <h2 className={styles.title}>Danh sách siêu âm</h2>
        <Button type="primary" onClick={() => navigate("/home/sono/bung")}>
          + Tạo mới
        </Button>
      </div>

      {/* FILTER */}
      <Row gutter={16} className={styles.filterGroup}>
        <Col span={24}>
          <Card
            title={
              <>
                <FilterOutlined /> Bộ lọc tìm kiếm
              </>
            }
            size="small"
          >
            <Row gutter={16}>
              {/* Search name */}
              <Col span={6}>
                <label>Tên bệnh nhân</label>
                <Input
                  value={pendingFilters.benh_nhan_ho_ten}
                  onChange={(e) =>
                    setPendingFilters({
                      ...pendingFilters,
                      benh_nhan_ho_ten: e.target.value,
                    })
                  }
                />
              </Col>

              <Col span={3}>
                <label>Trạng thái</label>
                <Select
                  style={{ width: "100%" }}
                  allowClear
                  placeholder="Chọn trạng thái"
                  value={pendingFilters.status}
                  onChange={(value) =>
                    setPendingFilters({
                      ...pendingFilters,
                      status: value,
                    })
                  }
                >
                  <Select.Option value={SONO_STATUS.PENDING}>
                    Chờ duyệt
                  </Select.Option>
                  <Select.Option value={SONO_STATUS.APPROVED}>
                    Đã duyệt
                  </Select.Option>
                  <Select.Option value={null}>Tất cả</Select.Option>
                </Select>
              </Col>

              {/* Clinic */}
              <Col span={3}>
                <label>PID</label>
                <Input
                  value={pendingFilters.benh_nhan_pid}
                  onChange={(e) =>
                    setPendingFilters({
                      ...pendingFilters,
                      benh_nhan_pid: e.target.value,
                    })
                  }
                />
              </Col>

              <Col span={4}>
                <label>SID</label>
                <Input
                  value={pendingFilters.benh_nhan_sid}
                  onChange={(e) =>
                    setPendingFilters({
                      ...pendingFilters,
                      benh_nhan_sid: e.target.value,
                    })
                  }
                />
              </Col>

              {/* Search button */}
              <Col
                span={6}
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setPage(1);
                    setFilters({ ...pendingFilters });
                  }}
                >
                  Tìm kiếm
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* LIST */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: setPage,
          }}
        />
      </Spin>
    </div>
  );
};

export default SonoList;
