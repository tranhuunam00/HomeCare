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
  const { user, isReadingForm, userPackages } = useGlobalAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "Ca chẩn đoán",
      icon: (
        <Avatar src="/icons/patient.png" size={40} style={{ marginTop: -2 }} />
      ),
      label: "Ca chẩn đoán",
      children: [
        {
          key: "/home/patients-diagnose",
          label: "Danh sách",
        },

        {
          key: "/home/doctor-use-form-drad",
          // icon: <Avatar src={"/icons/ketquadadoc.png"} size={40} />,
          label: "Kết quả đã đọc",
        },
      ],
    },
    // user?.id_role === USER_ROLE.ADMIN && {
    //   key: "Mẫu kết quả",
    //   icon: (
    //     <Avatar
    //       src="data:image/png;base64,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"
    //       size={40}
    //     />
    //   ),
    //   label: "Mẫu kết quả",
    //   children: [
    //     user?.id_role === USER_ROLE.ADMIN && {
    //       key: "templates",
    //       label: "Danh sách",
    //     },
    //   ],
    // },
    {
      key: "Pacs",
      icon: <Avatar src="/icons/pacs.png" size={40} />,
      label: "PACS",
      onClick: () => {
        toast.info("✨ Tính năng sắp ra mắt!");
      },
    },
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
      key: "/home/form-drad/use",
      icon: <Avatar src={"/icons/useNow.png"} size={40} />,
      label: "Đọc kết quả",
    },

    {
      key: "/home/intergrate",
      icon: <Avatar src="/icons/sono.png" size={40} />,
      label: "D-SONO",
      children: [
        { key: "/home/sono/bung", label: "Đọc ngay" },
        { key: "/home/sono/list", label: "Danh sách đã đọc" },
      ],
    },

    {
      key: "Ứng dụng",
      icon: <Avatar src={"/icons/tienich.png"} size={40} />,
      label: "Ứng dụng",
      children: [
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
      key: "/home/package",
      icon: <Avatar src="/icons/package.png" size={40} />,
      label: "Gói",
      children: [
        { key: "/home/subscription", label: "Gói đăng ký" },
        { key: "/home/package-request", label: "Yêu cầu của bạn" },
        { key: "/home/package-user", label: "Gói của bạn" },
      ],
    },

    {
      key: "/home/intergrate",
      icon: <Avatar src="/icons/intergrated.png" size={40} />,
      label: "Tích hợp",
      children: [{ key: "/home/partners", label: "Đối tác" }],
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
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState("/logo_home_care.png");
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
                  RADIOLOGY
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
