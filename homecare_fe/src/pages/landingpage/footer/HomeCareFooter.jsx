import React from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import styles from "./HomeCareFooter.module.scss";
import { COMPANY_INFO } from "../../../constant/company";

const HomeCareFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* LEFT */}
        <div className={styles.col}>
          <h3>Thông tin bản quyền tác giả:</h3>
          <p>Số chứng nhận bản quyền: 10506/2025/QTG</p>
          <p>
            Đơn vị cấp chứng nhận: cục Bản quyền tác giả, Bộ Văn hóa thể thao và
            du lịch
          </p>
          <p>Phạm vi chứng nhận: Việt Nam</p>

          <p className={styles.policy}>
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Chính sách bảo mật | Private policy
            </a>
          </p>
        </div>

        {/* RIGHT */}
        <div className={styles.col}>
          <h3>Thông tin đơn vị vận hành:</h3>
          <p>{COMPANY_INFO.nameUpper}</p>

          <p>
            <FaMapMarkerAlt /> {COMPANY_INFO.address}
          </p>

          <p>
            <FaPhoneAlt />{" "}
            <a href={`tel:${COMPANY_INFO.phone}`} style={{ color: "inherit" }}>{COMPANY_INFO.phoneDisplay}</a>
          </p>

          <p>
            <FaEnvelope /> {COMPANY_INFO.email}
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className={styles.copyright}>
        &nbsp;|&nbsp; Bản quyền 2025 &nbsp;|&nbsp;
      </div>
    </footer>
  );
};

export default HomeCareFooter;
