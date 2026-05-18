import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Checkbox, Col, Layout, Menu, Space } from "antd";
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
import { PATIENT_DIAGNOSE_COLOR, USER_ROLE } from "../../constant/app";
import { toast } from "react-toastify";
import { hasProOrBusiness } from "../../constant/permission";
import { Grid } from "antd";
import { PATIENT_DIAGNOSE_STATUS_FILTER } from "../patient/constant.patient";

const { useBreakpoint } = Grid;

const { Header } = Layout;

const Sidebar = ({ collapsed }) => {
  const { user, isReadingForm, userPackages } = useGlobalAuth();
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
        // user?.id_role === USER_ROLE.ADMIN && {
        //   key: "form-drad-list",
        //   icon: <Avatar src={"/icons/formver2.png"} size={40} />,
        //   label: "Mẫu kết quả v.2",
        //   children: [
        //     user?.id_role === USER_ROLE.ADMIN && {
        //       key: "/home/form-drad",
        //       label: "Tạo mẫu mới",
        //     },
        //     user?.id_role === USER_ROLE.ADMIN && {
        //       key: "/home/form-drad-list",
        //       label: "Danh sách mẫu",
        //     },

        //     user?.id_role === USER_ROLE.ADMIN && {
        //       key: "/home/form-ver2-names",

        //       label: "Danh sách tên mẫu",
        //     },
        //   ],
        // },

        user?.id_role === USER_ROLE.ADMIN && {
          key: "form-drad-list v.3",
          icon: <Avatar src={"/icons/formver2.png"} size={40} />,
          label: "Mẫu kết quả v.3",
          children: [
            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-ver3-names",
              label: "Danh sách tên mẫu",
            },
            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-drad-v3",
              label: "Tạo mẫu mới",
            },
            user?.id_role === USER_ROLE.ADMIN && {
              key: "/home/form-drad-list-v3",
              label: "Danh sách mẫu",
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
        // {
        //   key: "/home/intergrate",
        //   icon: <Avatar src="/icons/sono.png" size={40} />,
        //   label: "D-SONO",
        //   children: [
        //     { key: "/home/sono/bung", label: "Đọc ngay" },
        //     { key: "/home/sono/list", label: "Danh sách đã đọc" },
        //   ],
        // },
        // { key: "/tirads_nn", label: "Phần mềm D-TIRADS" },
        { key: "/home/birad", label: "Ứng dụng D-BIRADS" },
        { key: "/home/tirad", label: "Ứng dụng D-TIRADS" },

        { key: "/home/lungrad", label: "Ứng dụng D-LUNG" },
        { key: "/home/D-LIRADS", label: "Ứng dụng D-LIRADS" },
        { key: "/home/D-Pirads", label: "Ứng dụng D-Pirads" },

        { key: "/home/D-ORADS", label: "Ứng dụng D-ORADS" },

        { key: "/home/D-BOSNIAK", label: "Ứng dụng D-Bosniak" },
        { key: "/home/recist_nn", label: "Ứng dụng D-RECIST" },
        { key: "/home/D-BALTHAZA", label: "Ứng dụng D-CTSI" },
        { key: "/home/boneage", label: "Ứng dụng D-BONE" },
        { key: "/home/dipss", label: "Ứng dụng D-IPSS" },
        { key: "/home/D-COR", label: "Ứng dụng D-COR" },
        { key: "/home/D-CPS", label: "Ứng dụng D-CPS" },
        { key: "/home/D-VOGAN", label: "Ứng dụng D-LIVER" },
        { key: "/home/D-Spleen", label: "Ứng dụng D-Spleen" },
        { key: "/home/D-VOTHAN", label: "Ứng dụng D-KIDNEY" },
        { key: "/home/D-Pan", label: "Ứng dụng D-Pan" },
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
      toast.error("Bạn cần gói PRO hoặc HOSPITAL để sử dụng tính năng này!");
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
    item?.children?.some((child) => child.key === currentPath),
  )?.key;

  return (
    <Menu
      onClick={(e) => handleClick(e, isReadingForm)}
      defaultSelectedKeys={["products"]}
      mode="inline"
      items={menuItems}
      inlineCollapsed={collapsed}
      selectedKeys={[location.pathname]}
      defaultOpenKeys={parentKey ? [parentKey] : []}
    />
  );
};

const Home = () => {
  const {
    collapsed,
    setCollapsed,
    isOnWorkList,
    filterPatient: pendingFilters,
    setFilterPatient: setPendingFilters,
  } = useGlobalAuth();
  const [logo, setLogo] = useState("/logo_home_care.png");
  const screens = useBreakpoint();
  const deviceIsMobile = !screens.md;
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
              paddingTop: 0,
              display: deviceIsMobile ? "none" : "block",
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

            {isOnWorkList && (
              <Col span={12} style={{ marginBottom: 8 }}>
                <div
                  onClick={() =>
                    setPendingFilters({
                      ...pendingFilters,
                      my_received_cases: !pendingFilters?.my_received_cases,
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 20,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: pendingFilters?.my_received_cases
                      ? "#dbeafe"
                      : "#f3f4f6",
                    border: pendingFilters?.my_received_cases
                      ? "1px solid #6fc02d"
                      : "1px solid #061b46",
                    cursor: "pointer",
                    minHeight: 44,
                    minWidth: 80,
                  }}
                >
                  <Checkbox checked={pendingFilters?.my_received_cases} />

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: pendingFilters?.my_received_cases
                        ? "#2563eb"
                        : "#4b5563",
                    }}
                  >
                    Ca liên quan
                  </span>
                </div>
              </Col>
            )}

            {isOnWorkList && (
              <Col span={24}>
                <div style={{ width: "100%", paddingLeft: 2 }}>
                  <h4 style={{ display: deviceIsMobile ? "none" : "block" }}>
                    Lọc theo Trạng thái:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    {Object.entries(PATIENT_DIAGNOSE_STATUS_FILTER).map(
                      ([key, label]) => {
                        const intKey = Number(key);
                        const isChecked =
                          pendingFilters.status?.includes(intKey);

                        return (
                          <div
                            key={key}
                            onClick={() => {
                              const current = pendingFilters.status || [];
                              const newStatus = isChecked
                                ? current.filter((x) => x !== intKey)
                                : [...current, intKey];

                              setPendingFilters({
                                ...pendingFilters,
                                status: newStatus,
                              });
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              backgroundColor: PATIENT_DIAGNOSE_COLOR[intKey],
                              color: "#fff",
                              opacity: isChecked ? 1 : 0.4,
                              borderRadius: 6,
                              padding: "8px 10px",
                              cursor: "pointer",
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ pointerEvents: "none" }} // click cả khối
                            />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>
                              {label}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </Col>
            )}
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
