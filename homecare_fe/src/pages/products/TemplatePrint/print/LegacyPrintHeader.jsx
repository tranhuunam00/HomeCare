const LegacyPrintHeader = ({ printTemplate, languageTranslate }) => (
  <header
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
      alignItems: "flex-start",
      gap: 16,
    }}
  >
    <div style={{ flex: "0 0 auto" }}>
      <img
        src={
          printTemplate?.logo_url ||
          "https://via.placeholder.com/150x100?text=Logo"
        }
        width={72}
        height={72}
        style={{ objectFit: "contain" }}
        alt="Logo"
      />
    </div>

    <div style={{ flex: "1 1 220px", minWidth: 180 }}>
      <p style={{ fontWeight: 600, color: "#2f6db8", fontSize: 14, margin: "0 0 4px 0" }}>
        {printTemplate?.clinic_name || ""}
      </p>
      <p style={{ fontSize: 13, margin: "0 0 2px 0" }}>
        <strong>Chuyên khoa:</strong> {printTemplate?.department_name || "-"}
      </p>
      <p style={{ fontSize: 13, margin: 0 }}>
        <strong>Địa chỉ:</strong> {printTemplate?.address || "-"}
      </p>
    </div>

    <div style={{ flex: "1 1 180px", minWidth: 160 }}>
      <p style={{ fontSize: 13, margin: "0 0 2px 0" }}>
        <strong>Website:</strong> {printTemplate?.website || "http://..."}
      </p>
      <p style={{ fontSize: 13, margin: "0 0 2px 0" }}>
        <strong>Hotline:</strong> {printTemplate?.phone || "..."}
      </p>
      <p style={{ fontSize: 13, margin: 0 }}>
        <strong>Email:</strong> {printTemplate?.email || "..."}
      </p>
    </div>
  </header>
);

export default LegacyPrintHeader;
