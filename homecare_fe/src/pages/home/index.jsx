import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import TopHeader from "../../components/TopHeader/TopHeader";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE } from "../../constant/app";

const { Header } = Layout;

const Sidebar = ({ collapsed }) => {
  const { user, doctor, handleLogoutGlobal } = useGlobalAuth();
  const menuItems = [
    user?.id_role === USER_ROLE.ADMIN && {
      key: "Ca chẩn đoán",
      icon: (
        <Avatar
          src="https://stockdep.net/files/images/27167199.jpg"
          size={40}
          style={{ marginTop: -2 }}
        />
      ),
      label: "Ca chẩn đoán",
      children:
        user.id_role == USER_ROLE.ADMIN
          ? [
              {
                key: "patients-diagnose",
                label: "Danh sách",
              },
            ]
          : [],
    },
     user?.id_role === USER_ROLE.ADMIN &&{
      key: "Mẫu kết quả",
      icon: (
        <Avatar
          src="data:image/png;base64,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"
          size={40}
        />
      ),
      label: "Mẫu kết quả",
      children: [
        user?.id_role === USER_ROLE.ADMIN && {
          key: "templates",
          label: "Danh sách",
        },
      ],
    },
    {
      key: "Mẫu kết quả 2",
      icon: (
        <Avatar
          src={
            "https://png.pngtree.com/png-vector/20221118/ourmid/pngtree-flat-style-audit-icon-with-result-report-on-white-background-vector-png-image_41384148.jpg"
          }
          size={40}
        />
      ),
      label: "Mẫu kết quả phiên bản 2",
      children: [
        { key: "form-v2-list", label: "Danh sách" },
        user?.id_role === USER_ROLE.ADMIN && {
          key: "form-v2",
          label: "Tạo mới",
        },
        user?.id_role === USER_ROLE.ADMIN && {
          key: "form-ver2-names",

          label: "Danh sách tên mẫu ver2",
        },
        {
          key: "doctor-use-form-v2",
          label: "Kết quả đã dùng",
        },
      ],
    },

    {
      key: "Ứng dụng, tiện ích",
      icon: (
        <Avatar
          src={
            "https://static.vecteezy.com/system/resources/previews/023/014/146/non_2x/questionnaire-icon-in-modern-and-trendy-style-premium-vector.jpg"
          }
          size={40}
        />
      ),
      label: "Ứng dụng, tiện ích",
      children: [
        { key: "/tirads_nn", label: "Phần mềm D-TIRADS" },
        { key: "/recist_nn", label: "Phần mềm D-RECIST" },
        { key: "/tirad", label: "Phần mềm D-TIRADS-2" },
        { key: "/lungrad", label: "Phần mềm D-LUNG" },
        { key: "/birad", label: "Phần mềm D-BIRADS" },
        { key: "/boneage", label: "Phần mềm D-BONE" },
        { key: "/dipss", label: "Phần mềm D-IPSS" },
        { key: "/D-COR", label: "Phần mềm D-COR" },
        { key: "/D-CPS", label: "Phần mềm D-CPS" },
        { key: "/D-BALTHAZA", label: "Phần mềm D-CTSI" },
        { key: "/D-VOTHAN", label: "Phần mềm D-KIDNEY" },
        { key: "/D-VOGAN", label: "Phần mềm D-LIVER" },
        { key: "/D-BOSNIAK", label: "Phần mềm D-Bosniak" },
        { key: "/D-LIRADS", label: "Phần mềm D-LIRADS" },
        { key: "/D-ORADS", label: "Phần mềm D-ORADS" },
      ],
    },
    {
      key: "Mẫu in kết quả",
      icon: (
        <Avatar
          src="https://png.pngtree.com/png-clipart/20200224/original/pngtree-printer-icon-for-your-project-png-image_5214091.jpg"
          size={40}
        />
      ),
      label: "Mẫu in kết quả",
      children: [
        { key: "templates-print", label: "Danh sách" },
        // { key: "doctor-used", label: "Sử dụng" },
      ],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "Cơ sở",
      icon: (
        <Avatar
          src="https://png.pngtree.com/png-clipart/20230922/original/pngtree-school-building-flat-color-ui-icon-facility-elearning-solid-vector-png-image_12822392.png"
          size={40}
        />
      ),
      label: "Cơ sở",
      children: [{ key: "clinics", label: "Danh sách" }],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "Dịch vụ khám",
      icon: (
        <Avatar
          src="https://benhvientantao.com/wp-content/uploads/2021/12/Icon-tab-dich-vu_KHAM-SUC-KHOE-CHO-DOANH-NGHIEP-1024x1024.png"
          size={40}
        />
      ),
      label: "Dịch vụ khám",
      children: [
        { key: "template_services", label: "Dịch vụ" },
        { key: "exam-parts", label: "Bộ phận thăm khám" },
      ],
    },

    user?.id_role === USER_ROLE.ADMIN && {
      key: "Liên hệ",
      icon: (
        <Avatar
          src="https://daihocnguyentrai.edu.vn/wp-content/uploads/2021/12/anhlienhe.png"
          size={40}
        />
      ),
      label: "Liên hệ",
      children: [{ key: "contacts-admin", label: "Tất cả" }],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "Bác sĩ",
      icon: (
        <Avatar
          src="https://img.freepik.com/premium-vector/user-icon-icon_1076610-59410.jpg"
          size={40}
        />
      ),
      label: "Bác sĩ",
      children: [{ key: "customers", label: "Danh sách" }],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "permission",
      icon: (
        <Avatar
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8qsux4zSO3UdggzbqTPjNUdHwCI7LnMk9Ow"
          size={40}
        />
      ),
      label: "Nhân viên",
      children: [
        { key: "permission-role", label: "Phân quyền" },
        { key: "staff", label: "Nhân viên" },
        { key: "salary", label: "Bảng lương" },
      ],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "Báo cáo",
      icon: (
        <Avatar
          src="https://static.vecteezy.com/system/resources/previews/033/664/065/non_2x/seo-report-icon-in-illustration-vector.jpg"
          size={40}
        />
      ),
      label: "Báo cáo",
      children: [{ key: "report-product", label: "Sản phẩm" }],
    },
    user?.id_role === USER_ROLE.ADMIN && {
      key: "intergate",
      icon: (
        <Avatar
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBsdqP84ptWxCDbHZMpLQeN5AgDF1LUzzH8g"
          size={40}
        />
      ),
      label: "Tích hợp",
      children: [{ key: "integration-guide", label: "Hướng dẫn" }],
    },
  ].filter(Boolean); // loại bỏ các mục false nếu user không phải admin

  const navigate = useNavigate();

  const handleClick = (e) => {
    navigate(e.key);
  };

  return (
    <Menu
      onClick={handleClick}
      defaultSelectedKeys={["products"]}
      mode="inline"
      items={menuItems}
      style={{ height: "100%" }}
      inlineCollapsed={collapsed}
    />
  );
};

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState("/logo_home_care.jpg");
  const navigate = useNavigate();

  return (
    <>
      <TopHeader
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />

      <Layout style={{ minHeight: "100vh" }}>
        <>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={240}
            style={{
              background: "rgba(202, 196, 250, 0.1)",
              paddingTop: 16,
            }}
          >
            {!collapsed && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <img
                  src={logo}
                  alt="DAO Group Logo"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#000",
                  }}
                >
                  DAOGROUP
                </div>
              </div>
            )}
            <Sidebar collapsed={collapsed} />
          </Sider>

          <Content style={{ padding: 16, background: "#fff" }}>
            <div style={{ marginBottom: 8 }}>
              <ArrowLeftOutlined
                onClick={() => navigate(-1)} // quay lại trang trước
                style={{
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#1890ff",
                }}
              />
            </div>

            <Outlet />
          </Content>
        </>
      </Layout>
    </>
  );
};

export default Home;
