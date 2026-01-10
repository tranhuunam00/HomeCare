import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Select, message } from "antd";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import API_CALL from "../../../services/axiosClient";
import { useFormVer3Names } from "../../../hooks/useFormVer3Names";
import { FormVer3NameModal } from "./FormVer3NameModal";

export const FormVer3CloneModal = ({
  open,
  onCancel,
  cloneRecord,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { examParts, templateServices } = useGlobalAuth();

  // selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [filteredFormVer3Names, setFilteredFormVer3Names] = useState([]);
  const [openCreateName, setOpenCreateName] = useState(false);

  const filter = useMemo(() => {
    if (!selectedService || !selectedPart) return null;

    return {
      id_template_service: selectedService,
      id_exam_part: selectedPart,
    };
  }, [selectedService, selectedPart]);
  // 🔹 call hook với filter + paging
  const { formVer3Names, refetch } = useFormVer3Names({
    filter,
    page: 1,
    limit: 1000,
  });

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          id_clone: cloneRecord.id,
          id_formver3_name: values.id_formver3_name,
          id_template_service: values.id_template_service,
          id_exam_part: values.id_exam_part,
        };

        const res = await API_CALL.post("/formVer3/clone", payload);

        message.success("Clone FormVer3 thành công");
        onSuccess?.(res.data?.id || res.data?.data?.id);
        onCancel();
      } catch (err) {
        console.error(err);
        message.error("Có lỗi xảy ra khi clone FormVer3");
      }
    });
  };

  // 🔹 init form khi mở modal
  useEffect(() => {
    if (!cloneRecord || !open) return;

    setSelectedService(cloneRecord.id_template_service);
    setSelectedPart(cloneRecord.id_exam_part);

    form.setFieldsValue({
      id_clone: cloneRecord.id,
      id_template_service: cloneRecord.id_template_service,
      id_exam_part: cloneRecord.id_exam_part,
    });
  }, [cloneRecord, open, form]);

  useEffect(() => {
    setFilteredFormVer3Names(formVer3Names.filter((n) => !n.isUsed));
  }, [formVer3Names]);

  return (
    <Modal
      title="Clone FormVer3"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical">
        {/* Phân hệ */}
        <Form.Item
          name="id_template_service"
          label="Phân hệ"
          rules={[{ required: true, message: "Vui lòng chọn phân hệ" }]}
        >
          <Select
            placeholder="Chọn phân hệ"
            allowClear
            onChange={(v) => {
              setSelectedService(v);
              setSelectedPart(null);
              form.setFieldsValue({
                id_template_service: v,
                id_exam_part: undefined,
                id_formver3_name: undefined,
              });
            }}
          >
            {templateServices.map((ts) => (
              <Select.Option key={ts.id} value={ts.id}>
                {ts.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Bộ phận */}
        <Form.Item
          name="id_exam_part"
          label="Bộ phận"
          rules={[{ required: true, message: "Vui lòng chọn bộ phận" }]}
        >
          <Select
            placeholder="Chọn bộ phận"
            allowClear
            disabled={!selectedService}
            onChange={(v) => {
              setSelectedPart(v);
              form.setFieldsValue({
                id_exam_part: v,
                id_formver3_name: undefined,
              });
            }}
          >
            {examParts
              .filter((ep) => ep.id_template_service === selectedService)
              .map((ep) => (
                <Select.Option key={ep.id} value={ep.id}>
                  {ep.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        {/* Tên mẫu */}
        <Form.Item
          name="id_formver3_name"
          label="Tên mẫu"
          rules={[{ required: true, message: "Vui lòng chọn tên mẫu" }]}
        >
          <Select
            placeholder="Chọn tên mẫu"
            allowClear
            disabled={!selectedService || !selectedPart}
            notFoundContent={
              !filteredFormVer3Names.length ? (
                <span style={{ color: "#ff4d4f" }}>
                  Chưa có Tên mẫu V3 nào khả dụng Bạn cần tạo mới
                </span>
              ) : null
            }
          >
            {filteredFormVer3Names.map((n) => (
              <Select.Option key={n.id} value={n.id}>
                {n.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 8 }}>
        <a onClick={() => setOpenCreateName(true)}>+ Tạo Tên mẫu FormVer3</a>
      </div>
      <FormVer3NameModal
        open={openCreateName}
        onCancel={() => setOpenCreateName(false)}
        templateServices={templateServices}
        examParts={examParts}
        onSubmit={async (values) => {
          await API_CALL.post("/formVer3_name", values);
          setOpenCreateName(false);
          refetch();
        }}
        defaultValues={{
          id_template_service: selectedService,
          id_exam_part: selectedPart,
        }}
      />
    </Modal>
  );
};
