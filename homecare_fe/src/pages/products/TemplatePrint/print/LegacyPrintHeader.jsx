const LegacyPrintHeader = ({ printTemplate, languageTranslate }) => (
  <header
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 20,
      alignItems: "flex-start",
      gap: 20,
    }}
  >
    <div style={{ maxWidth: "350px", flex: 2 }}>
      <img
        src={
          printTemplate?.logo_url ||
          "https://via.placeholder.com/150x100?text=Logo"
        }
        width={80}
        height={80}
        alt="Logo"
      />
    </div>

    <div style={{ maxWidth: "350px", flex: 6 }}>
      <p style={{ fontWeight: 600, color: "#2f6db8", fontSize: 14 }}>
        {printTemplate?.clinic_name || ""}
      </p>
      <p style={{ fontSize: 13 }}>
        <strong>Chuyên khoa:</strong> {printTemplate?.department_name || "-"}
      </p>
      <p style={{ fontSize: 13 }}>
        <strong>Địa chỉ:</strong> {printTemplate?.address || "-"}
      </p>
    </div>

    <div style={{ maxWidth: "280px", flex: 4 }}>
      <p style={{ fontSize: 13 }}>
        <strong>Website:</strong> {printTemplate?.website || "http://..."}
      </p>
      <p style={{ fontSize: 13 }}>
        <strong>Hotline:</strong> {printTemplate?.phone || "..."}
      </p>
      <p style={{ fontSize: 13 }}>
        <strong>Email:</strong> {printTemplate?.email || "..."}
      </p>
    </div>
  </header>
);

export default LegacyPrintHeader;
