import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import TopHeader from "../../components/TopHeader/TopHeader";

const { Header } = Layout;

const menuItems = [
  {
    key: "Mẫu kết quả",
    icon: (
      <Avatar
        src="https://media.istockphoto.com/id/1458976957/vi/vec-to/h%E1%BA%ADu-qu%E1%BA%A3-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-k%E1%BA%BFt-qu%E1%BA%A3-logo-vector-c%C3%B3-th%E1%BB%83-ch%E1%BB%89nh-s%E1%BB%ADa.jpg?s=1024x1024&w=is&k=20&c=mi4tmB9Zrj_55BXa2ldWBJXWLYxRhUliLhQXB-1hV7Y="
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Mẫu kết quả",
    children: [
      {
        key: "products",
        label: "Danh sách",
        icon: (
          <Avatar
            src="https://file1.hutech.edu.vn/file/news/22c468210bf0e7d711a424c1d48f1d62.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
      {
        key: "Tirads",
        label: "D-Tirads",
        icon: (
          <Avatar
            src="https://radiologyassistant.nl/assets/1-tab-1615022783.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
      {
        key: "Recist",
        label: "D-Recist",
        icon: (
          <Avatar
            src="https://recist.eortc.org/wp-content/uploads/sites/4/2014/08/RECIST-logo-v3.2.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
    ],
  },
];

const Sidebar = ({ collapsed }) => {
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

          <Content style={{ padding: 24, background: "#fff" }}>
            <Outlet />
          </Content>
        </>
      </Layout>
    </>
  );
};

export default Home;
