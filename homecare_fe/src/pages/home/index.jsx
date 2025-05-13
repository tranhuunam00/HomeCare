import React, { useState } from "react";
import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import { Avatar, Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import LoginPage from "../authentication/LoginForm";
import TiradPage from "../tirads";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";

const items = [
  {
    key: "Profile",
    icon: (
      <Avatar
        src="https://png.pngtree.com/png-clipart/20200224/original/pngtree-cartoon-color-simple-male-avatar-png-image_5230557.jpg"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Trang cá nhân",
  },
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
        key: "Tirads",
        label: "Tirads",
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
        label: "Recist",
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

const Sidebar = () => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    navigate(e.key);
  };

  return (
    <Menu
      onClick={handleClick}
      style={{ width: 256, height: "100%" }}
      defaultSelectedKeys={["tirads"]}
      mode="inline"
      items={items}
    />
  );
};

const Home = () => {
  const [logo, setLogo] = useState("/logo_home_care.jpg");

  return (
    <div>
      <Layout
        style={{
          display: "flex",
          backgroundColor: "rgba(202, 196, 250, 0.1)",
        }}
      >
        <Sider
          width={200}
          style={{
            background: "rgba(202, 196, 250, 0.1)",
            color: "#fff",
            padding: "16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              marginBottom: 24,
              width: 240,
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
            <span style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
              DAOGROUP
            </span>
          </div>
          <Sidebar />
        </Sider>
        <Layout style={{ marginLeft: "60px" }}>
          <Content style={{}}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Home;
