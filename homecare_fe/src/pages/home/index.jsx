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
    {
      key: "Ca chẩn đoán",
      icon: (
        <Avatar
          src="https://stockdep.net/files/images/27167199.jpg"
          size={40}
          style={{ marginTop: -2 }}
        />
      ),
      label: "Ca chẩn đoán",
      children: [
        {
          key: "patients-diagnose",
          label: "Danh sách",
        },
      ],
    },
  ];
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
