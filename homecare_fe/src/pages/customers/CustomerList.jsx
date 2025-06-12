import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Row,
  Col,
  Card,
  Button,
  Spin,
  message,
} from "antd";
import { FilterOutlined, EditOutlined } from "@ant-design/icons";
import API_CALL from "../../services/axiosClient";
import styles from "./CustomerList.module.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const { Option } = Select;

const CustomerList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [clinicFilter, setClinicFilter] = useState();
  const [statusFilter, setStatusFilter] = useState();
  const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();

  const getClinicName = (clinicId) => {
    const found = clinics.find((clinic) => clinic.id === clinicId);
    return found ? found.name : "Không rõ";
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API_CALL.get("/doctor", {
        params: {
          full_name: searchName,
          id_clinic: clinicFilter,
          status: statusFilter,
          page,
          limit: 10,
        },
      });
      setDoctors(res.data.data.data);
      setTotal(res.data.data.count);
    } catch (error) {
      console.error("Lỗi lấy danh sách bác sĩ:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchName, clinicFilter, statusFilter, page]);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await API_CALL.get("/clinics", {
          params: { page: 1, limit: 100 },
        });
        setClinics(res.data.data.data);
      } catch (error) {
        toast.error(error?.response?.data?.message);
        console.error("Lỗi lấy danh sách phòng khám:", error);
      }
    };

    fetchClinics();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Phòng khám",
      key: "id_clinic",
      render: (_, record) => getClinicName(record.id_clinic),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value) =>
        value === 1 ? (
          <span style={{ color: "green" }}>Hoạt động</span>
        ) : (
          <span style={{ color: "red" }}>Ngừng hoạt động</span>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button onClick={() => navigate(`/home/profile/${record.id}`)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.CustomerList}>
      <h2 className={styles.title}>Danh sách bác sĩ</h2>

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
              <Col span={6}>
                <label>Tên bác sĩ</label>
                <Input
                  placeholder="Nhập tên..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <label>Phòng khám</label>
                <Input
                  placeholder="ID phòng khám"
                  value={clinicFilter}
                  onChange={(e) => setClinicFilter(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <label>Trạng thái</label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value={1}>Hoạt động</Option>
                  <Option value={0}>Ngừng hoạt động</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
        />
      </Spin>
    </div>
  );
};

export default CustomerList;
