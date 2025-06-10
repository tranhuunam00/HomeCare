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
        key: "templates",
        label: "Danh sách",
      },
      {
        key: "Tirads",
        label: "D-Tirads",
      },
      {
        key: "Recist",
        label: "D-Recist",
      },
    ],
  },
  {
    key: "Mẫu in kết quả",
    icon: (
      <Avatar
        src={
          "https://png.pngtree.com/png-clipart/20200224/original/pngtree-printer-icon-for-your-project-png-image_5214091.jpg"
        }
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Mẫu in kết quả",
    children: [
      {
        key: "templates-print",
        label: "Danh sách",
      },
    ],
  },

  {
    key: "Cơ sở",
    icon: (
      <Avatar
        src="https://media.istockphoto.com/id/1207077610/vi/vec-to/bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-b%E1%BB%87nh-vi%E1%BB%87n-d%E1%BA%A5u-hi%E1%BB%87u-y-t%E1%BA%BF-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-trung-t%C3%A2m-y-t%E1%BA%BF-t%C3%B2a-nh%C3%A0-ph%C3%B2ng-kh%C3%A1m-ch%C4%83m-s%C3%B3c.jpg?s=612x612&w=0&k=20&c=y8ORmGSTk-ucigOIzHy6ndkTUrG7jyUcAEVPJRYQqdc="
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Cơ sở",

    children: [
      {
        key: "clinics",
        label: "Danh sách",
      },
    ],
  },
  {
    key: "Bác sĩ",
    icon: (
      <Avatar
        src="https://img.freepik.com/premium-vector/user-icon-icon_1076610-59410.jpg?w=360"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Bác sĩ",

    children: [
      {
        key: "customers",
        label: "Danh sách",
      },
    ],
  },
  {
    key: "permission",
    icon: (
      <Avatar
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8qsux4zSO3UdggzbqTPjNUdHwCI7LnMk9Ow&s"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Nhân viên",
    children: [
      {
        key: "permission",
        label: "Phân quyền",
      },
      {
        key: "staffs",
        label: "Nhân viên",
      },
      {
        key: "payroll",
        label: "Bảng lương",
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
        label: "Sản phẩm",
      },
    ],
  },
  {
    key: "intergate",
    icon: (
      <Avatar
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBsdqP84ptWxCDbHZMpLQeN5AgDF1LUzzH8g&s"
        size={40}
        style={{ marginTop: -2 }}
      />
    ),
    label: "Tích hợp",
    children: [
      {
        key: "report",
        label: "Hướng dẫn",
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
