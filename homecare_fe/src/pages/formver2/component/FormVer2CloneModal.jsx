import React, { useEffect, useState } from "react";
import { Modal, Form, Select, message } from "antd";
import { useGlobalAuth } from "../../../contexts/AuthContext";
import API_CALL from "../../../services/axiosClient";
import { toast } from "react-toastify";

export const FormVer2CloneModal = ({
  open,
  onCancel,
  cloneRecord,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { examParts, templateServices, formVer2Names } = useGlobalAuth();

  // state cho selections
  const [selectedService, setSelectedService] = useState(
    cloneRecord?.id_template_service
  );
  const [selectedPart, setSelectedPart] = useState(cloneRecord?.id_exam_part);
  const [filteredFormVer2Names, setFilteredFormVer2Names] = useState([]);

  useEffect(() => {
    if (cloneRecord) {
      form.setFieldsValue({
        id_clone: cloneRecord?.id,
        id_template_service: cloneRecord?.id_template_service,
        id_exam_part: cloneRecord?.id_exam_part,
      });
    }
  }, [cloneRecord, form]);

  // cập nhật filteredFormVer2Names khi service/part thay đổi
  useEffect(() => {
    const filtered = formVer2Names.filter(
      (n) =>
        (!selectedService || n.id_template_service == selectedService) &&
        (!selectedPart || n.id_exam_part == selectedPart) &&
        !n.isUsed
    );
    setFilteredFormVer2Names(filtered);
  }, [formVer2Names, selectedService, selectedPart]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          ...values,
          id_clone: cloneRecord?.id,
        };
        const res = await API_CALL.post("/form-ver2/clone", payload);

        console.log("res", res);

        onSuccess(res.data.data.id);
        onCancel();
      } catch (err) {
        console.error(err);
        message.error("Có lỗi xảy ra khi clone");
      }
    });
  };

  return (
    <Modal
      title="Clone FormVer2"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
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
              setFilteredFormVer2Names([]);
              form.setFieldsValue({
                id_template_service: v,
                id_exam_part: undefined,
                id_formver2_name: undefined,
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
                id_formver2_name: undefined,
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
          name="id_formver2_name"
          label="Tên mẫu"
          rules={[{ required: true, message: "Vui lòng chọn tên mẫu" }]}
        >
          <Select
            placeholder="Chọn tên mẫu"
            allowClear
            disabled={!selectedService || !selectedPart}
          >
            {filteredFormVer2Names.map((n) => (
              <Select.Option key={n.id} value={n.id}>
                {n.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
