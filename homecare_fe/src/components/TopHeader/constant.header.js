const COLUMN_SETTING_STORAGE_KEY = "patientDiagnose_column_settings";
const allColumns = useMemo(
  () => [
    {
      title: "",
      key: "STT",
      align: "center", // ✅ CĂN BÊN PHẢI
      width: 40,
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      fixed: "left",
      width: 60,
      align: "center",
      sorter: true,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag style={{ width: 80 }} color={PATIENT_DIAGNOSE_COLOR[status]}>
          {PATIENT_DIAGNOSE_STATUS[status]}
        </Tag>
      ),
      sorter: true,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: true,
    },

    {
      title: "Năm sinh",
      dataIndex: "birth_year",
      key: "birth_year",
      width: 80,
      align: "center",
    },
    { title: "CCCD", dataIndex: "CCCD", key: "CCCD", width: 160 },
    {
      title: "Lâm sàng",
      dataIndex: "Indication",
      key: "Indication",
      width: 260,
    },

    {
      width: 170,
      title: "Phân hệ",
      dataIndex: "id_template_service",
      key: "id_template_service",
      render: (val) => templateServices?.find((t) => t.id == val)?.name,
    },

    { title: "PID", dataIndex: "PID", key: "PID", width: 120 },
    { title: "SID", dataIndex: "SID", key: "SID", width: 120 },
    {
      title: "SĐT",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      align: "center",
    },
    {
      width: 150,
      title: "Bộ phận",
      dataIndex: "id_exam_part",
      key: "id_exam_part",
      render: (val) => examParts?.find((t) => t.id == val)?.name,
    },

    {
      width: 220,
      title: "Phòng khám",
      dataIndex: "id_clinic",
      key: "id_clinic",
      render: (val) => clinicsAll?.find((t) => t.id == val)?.name,
    },

    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    { title: "Địa chỉ", dataIndex: "address", key: "address", width: 220 },
    {
      title: "Quốc tịch",
      dataIndex: "countryCode",
      key: "countryCode",
      width: 140,
    },
    {
      title: "Tỉnh/TP",
      dataIndex: "province_code",
      key: "province_code",
      render: (val) => getProvinceNameByCode(val),

      width: 140,
    },
    {
      title: "Phường/Xã",
      dataIndex: "ward_code",
      key: "ward_code",
      render: (val) => getWardNameByCode(val),
      width: 140,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (value) =>
        value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "--",
    },

    {
      title: "Người đọc",
      key: "processingDoctor",
      width: 220,
      render: (_, record) => {
        const d = record?.id_doctor_in_processing_doctor;
        if (!d) return <span style={{ color: "#999" }}>Chưa phân công</span>;

        const title = [d.academic_title, d.degree].filter(Boolean).join(".");

        return (
          <span>
            {title + ". "}

            {d.full_name}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) =>
        (user?.id_role === USER_ROLE.ADMIN ||
          record.createdBy === user?.id) && (
          <Space>
            <Button
              icon={<EditOutlined />} // 👉 Nút cập nhật
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/home/patients-diagnose/edit/" + record.id);
              }}
            />
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
            />

            <Button
              icon={<CopyOutlined />}
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                handleClone(record);
              }}
            />
          </Space>
        ),
    },
  ],
  [user, clinicsAll, examParts, templateServices, page],
);
const handleSaveColumnSettings = ({
  orderedKeys,
  visibleKeys: newVisibleKeys,
  widths,
}) => {
  const payload = {
    orderedKeys,
    visibleKeys: newVisibleKeys,
    widths,
  };

  localStorage.setItem(COLUMN_SETTING_STORAGE_KEY, JSON.stringify(payload));

  // rebuild columns
  const finalColumns = orderedKeys
    .map((key) => allColumns.find((c) => c.key === key))
    .filter((col) => col && newVisibleKeys.includes(col.key))
    .map((col) => ({
      ...col,
      width: widths[col.key] ?? col.width,
    }));

  setVisibleKeys(newVisibleKeys);
  setCustomColumns(finalColumns);
};
