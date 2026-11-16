import React from "react";
import { Form, Input, Select, Button, Typography, Row, Col, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ProcedureSection({
  form,
  isEdit = true,
  isMobile = false,
  languageTranslate = "vi",
  translateLabel,
  reloading = false,
  onReload,
  templateServices = [],
  sortTemplateServices,
  getServiceLabel,
  selectedIDs = {},
  setSelectedIDs,
  filteredExamParts = [],
  setFilteredFormVer3Names,
  filteredFormVer3Names = [],
  imagingMode = "STRUCTURED_TABLE",
  patientDiagnose,
  idEdit,
  printTemplateList = [],
  setPrintTemplate,
  onFormVer3Select,
  LANGUAGE_OPTIONS = [],
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: isMobile ? "10px 12px 6px" : "14px 16px 8px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Title level={4} style={{ color: "#2f6db8", margin: 0, fontSize: 15, fontWeight: 700 }}>
          {translateLabel ? translateLabel(languageTranslate, "Kỹ thuật thực hiện", true) : "KỸ THUẬT THỰC HIỆN"}
        </Title>
        <Tooltip title="Làm mới danh mục (Phân hệ, Bộ phận, Mẫu)">
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined style={{ color: "#2563eb" }} />}
            loading={reloading}
            onClick={onReload}
            style={{ color: "#2563eb", fontWeight: 500, fontSize: 12 }}
          >
            Làm mới danh mục
          </Button>
        </Tooltip>
      </div>

      <Row gutter={[12, 4]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>{translateLabel ? translateLabel(languageTranslate, "Chỉ định", false) : "Chỉ định"}</span>}
            name="id_template_service"
            rules={[{ required: true, message: "Chọn kỹ thuật" }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              size="middle"
              placeholder="Chọn chỉ định"
              disabled={true}
              allowClear
              style={{ width: "100%", fontSize: 13 }}
              onChange={(value) => {
                form.setFieldsValue({
                  id_exam_part: undefined,
                  id_formver3_name: undefined,
                });
                setSelectedIDs?.((prev) => ({
                  ...prev,
                  id_template_service: value,
                  id_exam_part: null,
                  id_formver3_name: null,
                }));
                setFilteredFormVer3Names?.([]);
              }}
            >
              {(sortTemplateServices ? sortTemplateServices(templateServices) : templateServices).map((s) => (
                <Option key={s.id} value={s.id}>
                  {getServiceLabel ? getServiceLabel(s, languageTranslate) : (s.name || s.label)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>{translateLabel ? translateLabel(languageTranslate, "bodyPart", false) : "Bộ phận"}</span>}
            name="id_exam_part"
            rules={[{ required: true, message: "Chọn bộ phận" }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              size="middle"
              placeholder="Chọn bộ phận thăm khám"
              disabled={true}
              allowClear
              style={{ width: "100%", fontSize: 13 }}
              onChange={(value) => {
                form.setFieldsValue({ id_formver3_name: undefined });
                setSelectedIDs?.((prev) => ({
                  ...prev,
                  id_exam_part: value,
                  id_formver3_name: null,
                }));
                setFilteredFormVer3Names?.([]);
              }}
              notFoundContent={
                selectedIDs?.id_template_service
                  ? "Không có bộ phận cho phân hệ này"
                  : "Chọn Phân hệ trước"
              }
            >
              {filteredExamParts
                .slice()
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map((s) => (
                  <Option key={s.id} value={s.id}>
                    {getServiceLabel ? getServiceLabel(s, languageTranslate) : (s.name || s.label)}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>{translateLabel ? translateLabel(languageTranslate, "language", false) : "Ngôn ngữ"}</span>}
            name="language"
            rules={[{ required: true }]}
            style={{ marginBottom: 12 }}
          >
            <Select size="middle" disabled={!isEdit} placeholder="VI / EN" style={{ width: "100%", fontSize: 13 }}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Option
                  key={opt.value}
                  value={opt.value}
                  disabled={
                    !!idEdit || (!idEdit && !["vi", "en"].includes(opt.value))
                  }
                >
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[12, 4]}>
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>{translateLabel ? translateLabel(languageTranslate, "resultTemplate", false) : "Mẫu đọc kết quả"}</span>}
            name="id_formver3_name"
            rules={
              imagingMode === "FAST_SONO" || imagingMode === "FREE_TEXT"
                ? []
                : [{ required: true, message: "Chọn tên mẫu" }]
            }
            style={{ marginBottom: 12 }}
          >
            <Select
              size="middle"
              allowClear
              disabled={
                !isEdit ||
                !selectedIDs?.id_template_service ||
                !selectedIDs?.id_exam_part
              }
              style={{ width: "100%", fontSize: 13 }}
              placeholder={
                !selectedIDs?.id_template_service ||
                !selectedIDs?.id_exam_part
                  ? "Chọn Phân hệ & Bộ phận trước"
                  : imagingMode === "FAST_SONO" || imagingMode === "FREE_TEXT"
                  ? "Không bắt buộc (đã có đọc nhanh / tự do)"
                  : "Chọn tên mẫu"
              }
              showSearch
              optionFilterProp="children"
              notFoundContent={
                selectedIDs?.id_template_service && selectedIDs?.id_exam_part
                  ? "Không có tên mẫu phù hợp"
                  : "Chưa đủ điều kiện để chọn"
              }
              onChange={onFormVer3Select}
            >
              {filteredFormVer3Names.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Form.Item
            label={<span style={{ fontWeight: 600, fontSize: 13 }}>{translateLabel ? translateLabel(languageTranslate, "resultPrint", false) : "Mẫu in kết quả"}</span>}
            name="id_print_template"
            rules={[{ required: true, message: "Chọn mẫu in" }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              size="middle"
              disabled={!isEdit}
              showSearch
              allowClear
              style={{ width: "100%", fontSize: 13 }}
              placeholder="Chọn mẫu in"
              optionFilterProp="children"
              onChange={(val) => {
                const printT = printTemplateList.find((t) => t.id == val);
                setPrintTemplate?.(printT);
                form.setFieldsValue({ id_print_template: printT?.id });
              }}
              filterOption={(input, option) =>
                option?.children?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {printTemplateList.map((tpl) => (
                <Option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="implementMethod"
        label={<span style={{ fontWeight: 600, fontSize: 13 }}>{languageTranslate === "en" ? "Procedure description" : "Quy trình kỹ thuật thực hiện"}</span>}
        tooltip="Mô tả kỹ thuật chụp / chiếu / can thiệp (tùy chọn)"
        style={{ marginBottom: 6 }}
      >
        <TextArea
          disabled={!isEdit}
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{ fontSize: 13, borderRadius: 6 }}
          placeholder="Nhập mô tả quy trình kỹ thuật..."
        />
      </Form.Item>
    </div>
  );
}
