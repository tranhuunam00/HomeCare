import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { toast } from "react-toastify";
import { hasProOrBusiness } from "../../constant/permission";

const { Header } = Layout;

const Sidebar = ({ collapsed }) => {
  const { user, isReadingForm, userPackages, isOnWorkList, setIsOnWorkList } =
    useGlobalAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: (
        <Avatar src="/icons/patient.png" size={40} style={{ marginTop: -2 }} />
      ),
      label: "WORKLIST",
      key: "/home/patients-diagnose",
      // children: [
      //   {
      //     key: "/home/patients-diagnose",
      //     label: "Danh sách",
      //   },

      //   // {
      //   //   key: "/home/form-drad/use",
      //   //   label: "Đọc ca mới",
      //   // },
      //   // {
      //   //   key: "/home/doctor-use-form-drad",
      //   //   // icon: <Avatar src={"/icons/ketquadadoc.png"} size={40} />,
      //   //   label: "Kết quả đã đọc",
      //   // },
      // ],
    },

    {
      key: "Pacs",
      icon: <Avatar src="/icons/pacs.png" size={40} />,
      label: "PACS",
      onClick: () => {
        toast.info("✨ Tính năng sắp ra mắt!");
      },
    },

    {
      key: "Quản lý",
      icon: <Avatar src="/icons/formver2.png" size={40} />,
      label: "Quản lý",
      children: [
        user?.id_role === USER_ROLE.ADMIN && {
          key: "form-drad-list",
          icon: <Avatar src={"/icons/formver2.png"} size={40} />,
          label: "Mẫu kết quả",
          children: [
            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-drad",
              label: "Tạo mẫu mới",
            },
            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-drad-list",
              label: "Danh sách mẫu",
            },

            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-ver2-names",

              label: "Danh sách tên mẫu",
            },
          ],
        },

        {
          key: "/home/templates-print",
          icon: <Avatar src="/icons/printTemplate.png" size={40} />,
          label: "Mẫu in kết quả",
        },
        {
          key: "/home/clinics",
          icon: <Avatar src="/icons/clinic.png" size={40} />,
          label: "Phòng khám",
        },
        user?.id_role === USER_ROLE.ADMIN && {
          key: "Dịch vụ khám",
          icon: <Avatar src="/icons/templateservice.png" size={40} />,
          label: "Dịch vụ khám",
          children: [
            { key: "/home/template_services", label: "Phân hệ" },
            { key: "/home/exam-parts", label: "Bộ phận" },
          ],
        },
        user?.id_role === USER_ROLE.ADMIN && {
          key: "Liên hệ",
          icon: <Avatar src="/icons/contact.png" size={40} />,
          label: "Liên hệ",
          children: [{ key: "/home/contacts-admin", label: "Tất cả" }],
        },
        user?.id_role === USER_ROLE.ADMIN && {
          key: "Bác sĩ",
          icon: <Avatar src="/icons/doctor.png" size={40} />,
          label: "Bác sĩ",
          children: [{ key: "/home/customers", label: "Danh sách" }],
        },
        {
          key: "/home/intergrate",
          icon: <Avatar src="/icons/intergrated.png" size={40} />,
          label: "Tích hợp",
          children: [{ key: "/home/partners", label: "Đối tác" }],
        },
      ],
    },

    {
      key: "Ứng dụng",
      icon: <Avatar src={"/icons/tienich.png"} size={40} />,
      label: "Ứng dụng",
      children: [
        {
          key: "/home/intergrate",
          icon: <Avatar src="/icons/sono.png" size={40} />,
          label: "D-SONO",
          children: [
            { key: "/home/sono/bung", label: "Đọc ngay" },
            { key: "/home/sono/list", label: "Danh sách đã đọc" },
          ],
        },
        // { key: "/tirads_nn", label: "Phần mềm D-TIRADS" },
        { key: "/home/recist_nn", label: "Ứng dụng D-RECIST" },
        { key: "/home/tirad", label: "Ứng dụng D-TIRADS" },
        { key: "/home/lungrad", label: "Ứng dụng D-LUNG" },
        { key: "/home/birad", label: "Ứng dụng D-BIRADS" },
        { key: "/home/boneage", label: "Ứng dụng D-BONE" },
        { key: "/home/dipss", label: "Ứng dụng D-IPSS" },
        { key: "/home/D-COR", label: "Ứng dụng D-COR" },
        { key: "/home/D-CPS", label: "Ứng dụng D-CPS" },
        { key: "/home/D-BALTHAZA", label: "Ứng dụng D-CTSI" },
        { key: "/home/D-VOTHAN", label: "Ứng dụng D-KIDNEY" },
        { key: "/home/D-VOGAN", label: "Ứng dụng D-LIVER" },
        { key: "/home/D-BOSNIAK", label: "Ứng dụng D-Bosniak" },
        { key: "/home/D-LIRADS", label: "Ứng dụng D-LIRADS" },
        { key: "/home/D-ORADS", label: "Ứng dụng D-ORADS" },
      ],
    },

    {
      key: "/home/package",
      icon: <Avatar src="/icons/package.png" size={40} />,
      label: "Gói",
      children: [
        { key: "/home/subscription", label: "Gói đăng ký" },
        { key: "/home/package-request", label: "Yêu cầu của bạn" },
        { key: "/home/package-user", label: "Gói của bạn" },
      ],
    },
  ].filter(Boolean); // loại bỏ các mục false nếu user không phải admin

  const handleClick = (e, isReadingForm) => {
    const key = e.key;
    if (e.key === "Pacs") return;
    const isAppFeature =
      key.startsWith("/home/recist_nn") ||
      key.startsWith("/home/tirad") ||
      key.startsWith("/home/lungrad") ||
      key.startsWith("/home/birad") ||
      key.startsWith("/home/boneage") ||
      key.startsWith("/home/dipss") ||
      key.startsWith("/home/D-COR") ||
      key.startsWith("/home/D-CPS") ||
      key.startsWith("/home/D-BALTHAZA") ||
      key.startsWith("/home/D-VOTHAN") ||
      key.startsWith("/home/D-VOGAN") ||
      key.startsWith("/home/D-BOSNIAK") ||
      key.startsWith("/home/D-LIRADS") ||
      key.startsWith("/home/D-ORADS");

    if (
      isAppFeature &&
      !hasProOrBusiness(userPackages) &&
      user.id_role != USER_ROLE.ADMIN
    ) {
      toast.error("Bạn cần gói PRO hoặc BUSINESS để sử dụng tính năng này!");
      return;
    }

    if (isReadingForm) {
      const newWindow = window.open(key, "_blank");
      if (newWindow) {
        newWindow.focus();
      } else {
        console.warn("window.open returned null — tab may be blocked");
      }
    } else {
      navigate(key);
    }
  };

  const currentPath = location.pathname;

  const parentKey = menuItems.find((item) =>
    item?.children?.some((child) => child.key === currentPath)
  )?.key;

  return (
    <Menu
      onClick={(e) => handleClick(e, isReadingForm)}
      defaultSelectedKeys={["products"]}
      mode="inline"
      items={menuItems}
      style={{ height: "100%" }}
      inlineCollapsed={collapsed}
      selectedKeys={[location.pathname]}
      defaultOpenKeys={parentKey ? [parentKey] : []}
    />
  );
};

const Home = () => {
  const { collapsed, setCollapsed } = useGlobalAuth();
  const [logo, setLogo] = useState("/logo_home_care.png");
  const navigate = useNavigate();

  return (
    <>
      <TopHeader
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />

      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
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
                  RADIOLOGY
                </div>
              </div>
            )}
            <Sidebar collapsed={collapsed} />
          </Sider>

          <Content style={{ padding: 8, background: "#fff" }}>
            <Outlet />
          </Content>
        </>
      </Layout>
    </>
  );
};

export default Home;
