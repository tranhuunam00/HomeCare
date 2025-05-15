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
  {
    key: "Khách hàng",
    icon: (
      <Avatar
        src="https://cdn5.vectorstock.com/i/1000x1000/66/09/outline-customer-icon-isolated-black-simple-line-vector-28256609.jpg"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Khách hàng",
    children: [
      {
        key: "Danh sách",
        label: "Danh sách",
        icon: (
          <Avatar
            src="https://cdn-icons-png.flaticon.com/256/809/809521.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
    ],
  },
  {
    key: "permission",
    icon: (
      <Avatar
        src="https://img.freepik.com/premium-vector/user-icon-icon_1076610-59410.jpg?w=360"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Nhân viên và user",
    children: [
      {
        key: "permission",
        label: "Phân quyền",
        icon: (
          <Avatar
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIFHQqz1gdok6-ye65k0vVIV2np0Z_LbkQag&s"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
      {
        key: "employee",
        label: "Nhân viên",
        icon: (
          <Avatar
            src="https://www.freeiconspng.com/thumbs/computer-user-icon/computer-user-icon-2.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
      {
        key: "payroll",
        label: "Bảng lương",
        icon: (
          <Avatar
            src="https://cdn-icons-png.flaticon.com/512/6626/6626226.png"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
    ],
  },
  {
    key: "Báo cáo",
    icon: (
      <Avatar
        src="https://static.vecteezy.com/system/resources/previews/033/664/065/non_2x/seo-report-icon-in-illustration-vector.jpg"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Báo cáo",
    children: [
      {
        key: "report",
        label: "Danh sách báo cáo",
        icon: (
          <Avatar
            src="data:image/png;base64,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"
            size={30}
            style={{ marginTop: -2 }}
          />
        ),
      },
    ],
  },
  {
    key: "intergate",
    icon: (
      <Avatar
        src="https://static.vecteezy.com/system/resources/previews/033/664/065/non_2x/seo-report-icon-in-illustration-vector.jpg"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Tích hợp",
    children: [
      {
        key: "report",
        label: "Hướng dẫn",
        icon: (
          <Avatar
            src="data:image/png;base64,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"
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
