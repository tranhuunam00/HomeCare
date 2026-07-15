import React, { useState } from "react";
import {
  Input,
  Avatar,
  Tooltip,
  Dropdown,
  Menu,
  Drawer,
  Divider,
  Button,
  Select,
  Typography,
} from "antd";
import {
  MenuOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  UserAddOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./TopHeader.module.scss";
import { QRCodeCanvas } from "qrcode.react";
import { useGlobalAuth } from "../../contexts/AuthContext";
import { USER_ROLE_ID } from "../../constant/app";
import useToast from "../../hooks/useToast";
import NotificationBell from "../../pages/notifications/NotificationBell";
import FlowModal from "../../pages/patient/setting/nodes/FlowModal";
import { toast } from "react-toastify";
import ImportPatientModal from "../../pages/patient/Import/ImportPatientModal";
import ReloadTSAndExamPartsButton from "../ReloadTSAndExamPartsButton";

const qrValue = `https://www.daogroup.vn/`;
const currentEndpont = `${
  import.meta.env.VITE_MAIN_ENDPOINT || "http://localhost:5173"
}`;

const TopHeader = ({ collapsed, toggleSidebar }) => {
  const [rightDrawerVisible, setRightDrawerVisible] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);

  const {
    user,
    doctor,
    handleLogoutGlobal,
    isOnWorkList,
    setIsOnWorkList,
    filterPatient: pendingFilters,
    setFilterPatient: setPendingFilters,
    clinicsAll,
    templateServices,
    totalPatient,
  } = useGlobalAuth();
  const { showWarning } = useToast();
  const navigate = useNavigate();

  const showRightDrawer = () => setRightDrawerVisible(true);
  const closeRightDrawer = () => setRightDrawerVisible(false);

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "account":
        navigate("account");
        break;
      case "wallet":
        showWarning("Sắp ra mắt");
        break;
      case "logout":
        handleLogoutGlobal();
        break;
      case "connect":
        showWarning("Sắp ra mắt");
        break;
      default:
        break;
    }
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="user" disabled>
        <div style={{ lineHeight: "1.2" }}>
          <strong style={{ color: "#1677ff" }}>{doctor?.full_name}</strong>
          <br />
          <small>{`${USER_ROLE_ID[user?.id_role]}`}</small>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="account">Quản Lý Tài Khoản</Menu.Item>
      <Menu.Item key="logout">Đăng Xuất</Menu.Item>
    </Menu>
  );
  // if (isOnWorkList) {
  //   return <div className={styles.topHeader} style={{ height: 1 }}></div>;
  // }
  return (
    <div className={styles.topHeader}>
      {/* --- Logo & Toggle --- */}
      <div className={styles.topHeader__left} style={{ cursor: "pointer" }}>
        <img
          onClick={() => window.open(currentEndpont)}
          src="/logo_home_care.png"
          className={styles.topHeader__logo}
          alt="logo"
        />
        {!collapsed && <span className={styles.topHeader__title}>D-RADS</span>}
        <Tooltip title={collapsed ? "Mở rộng menu" : "Thu nhỏ menu"}>
          <MenuOutlined
            style={{ marginLeft: 16, cursor: "pointer" }}
            onClick={toggleSidebar}
            className={styles.topHeader__toggleIcon}
          />
        </Tooltip>
      </div>
      <Tooltip title="Quy trình">
        <Button
          size="small"
          icon={<ApartmentOutlined />}
          style={{
            background: "linear-gradient(135deg, #3526b9, #69b1ff)",
            border: "none",
            color: "#fff",
            height: 28,
            fontSize: "12px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #24552f, #4096ff)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #3526b9, #69b1ff)";
          }}
          onClick={() => setOpenWorkflow(true)}
        >
          Quy trình
        </Button>
      </Tooltip>
      {isOnWorkList && (
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155", whiteSpace: "nowrap" }}>
          Số Ca = {totalPatient}
        </span>
      )}

      {isOnWorkList && (
        <Select
          size="small"
          allowClear
          style={{ width: 130, height: 28 }}
          popupMatchSelectWidth={false}
          value={pendingFilters.id_template_service}
          placeholder="Phân hệ"
          onChange={(value) =>
            setPendingFilters({
              ...pendingFilters,
              id_template_service: value,
            })
          }
        >
          {templateServices?.map((t) => (
            <Option key={t.id} value={t.id}>
              {t.name}
            </Option>
          ))}
        </Select>
      )}
      {isOnWorkList && (
        <Input
          placeholder="PID"
          size="small"
          onChange={(e) =>
            setPendingFilters({ ...pendingFilters, PID: e.target.value })
          }
          allowClear
          value={pendingFilters?.PID}
          style={{
            width: 100,
            height: 28,
            fontSize: "12px",
            borderRadius: "4px",
            borderColor: "#cbd5e1",
          }}
        />
      )}
      {isOnWorkList && (
        <Input
          placeholder="Họ tên bệnh nhân"
          size="small"
          onChange={(e) =>
            setPendingFilters({ ...pendingFilters, name: e.target.value })
          }
          allowClear
          value={pendingFilters?.name}
          style={{
            width: 140,
            height: 28,
            fontSize: "12px",
            borderRadius: "4px",
            borderColor: "#cbd5e1",
          }}
        />
      )}
      {isOnWorkList && (
        <Select
          size="small"
          style={{ width: 160, height: 28 }}
          allowClear
          showSearch
          popupMatchSelectWidth={false}
          value={pendingFilters.id_clinic}
          placeholder="Chọn phòng khám"
          optionFilterProp="children"
          onChange={(value) =>
            setPendingFilters({ ...pendingFilters, id_clinic: value })
          }
        >
          {clinicsAll?.map((c) => (
            <Option key={c.id} value={c.id}>
              {c.name}
            </Option>
          ))}
        </Select>
      )}
      <Button
        type="primary"
        size="small"
        style={{ height: 28, fontSize: "12px" }}
        icon={<UserAddOutlined />}
        onClick={() => navigate("/home/patients-diagnose/create")}
      >
        Thêm
      </Button>
      <Button
        type="primary"
        size="small"
        style={{ height: 28, fontSize: "12px" }}
        icon={<UploadOutlined />}
        onClick={() => setOpenImportModal(true)}
      >
        Import
      </Button>

      {/* --- Right side --- */}
      <div className={styles.topHeader__right}>
        {/* Avatar Dropdown */}
        <Dropdown
          overlay={userMenu}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              className={styles.topHeader__right_avatar}
              style={{
                backgroundColor: "#d9d9d9",
                cursor: "pointer",
              }}
              src={
                doctor?.avatar_url ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
            />
            <div
              className={styles.topHeader__right_name}
              style={{ marginLeft: 8, fontWeight: "bold" }}
            >
              {[
                doctor?.academic_title ? `${doctor.academic_title}.` : null,
                doctor?.degree ? `${doctor.degree}.` : null,
                doctor?.full_name,
              ]
                .filter(Boolean)
                .join(" ")}
            </div>
          </div>
        </Dropdown>

        {/* Bell notification */}
        <Tooltip title="Thông báo">
          <NotificationBell />
        </Tooltip>

        {/* App icon mở Drawer */}
        <AppstoreOutlined
          onClick={showRightDrawer}
          className={styles.topHeader__rightToggle}
        />

        {/* --- Drawer --- */}
        <Drawer
          title={null}
          placement="right"
          width={320}
          onClose={closeRightDrawer}
          open={rightDrawerVisible}
          closable={false}
          className={styles.rightDrawer}
        >
          <div className={styles.drawerHeader}>
            <div>
              <div className={styles.customerName}>D-RADS</div>
              <div className={styles.version}>ver. 1.0</div>
            </div>
            <div className={styles.drawerClose} onClick={closeRightDrawer}>
              ✕
            </div>
          </div>

          {/* QR liên hệ */}
          <div className={styles.qrContact}>
            <QRCodeCanvas value={qrValue} size={128} level="H" includeMargin />
            <p>
              Liên hệ <strong>0961 766 816</strong>
            </p>
            <div className={styles.socials}>
              <a href="#">Zalo</a> · <a href="#">Facebook</a> ·{" "}
              <a href="https://www.daogroup.vn/" target="_blank">
                Website
              </a>
            </div>
          </div>

          <Divider />

          {/* ✅ Thêm phần Chính sách & Điều khoản */}
          <div className={styles.policyLinks}>
            <h4 style={{ fontWeight: 600, marginBottom: 8 }}>
              Tài liệu & pháp lý
            </h4>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.8 }}>
              <li>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔒 Chính sách bảo mật dữ liệu
                </a>
              </li>

              <li>
                <a
                  href="mailto:daogroupltd@gmail.com"
                  rel="noopener noreferrer"
                >
                  📧 Liên hệ hỗ trợ: daogroupltd@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </Drawer>
      </div>

      <FlowModal
        open={openWorkflow}
        onClose={() => setOpenWorkflow(false)}
        onAction={(step) => {
          switch (step.action) {
            case "LOCK_READ":
              // call API lock
              break;
            case "CANCEL_READ":
              // unlock
              break;
            case "APPROVE":
              // duyệt
              break;
            case "CANCEL_APPROVE":
              // hủy duyệt
              break;
            default:
              console.log(step.action);
          }
        }}
      />
      <ImportPatientModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onImportSuccess={() => {
          toast.success(
            "Import bệnh nhân thành công! Vui lòng làm mới trang để cập nhật dữ liệu.",
          );
        }}
      />
    </div>
  );
};

export default TopHeader;
