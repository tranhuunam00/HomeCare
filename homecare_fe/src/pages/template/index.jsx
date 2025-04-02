import { Link } from "react-router-dom";

import {
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Button,
  Typography,
} from "antd";
import TargetLesionsTable from "./_TargetLesionsTable";

const { Title } = Typography;
const { TextArea } = Input;

const PatientForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form Values:", values);
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      labelAlign="left"
      onFinish={onFinish}
      style={{ maxWidth: 900 }}
    >
      <Title level={4}>THÔNG TIN BỆNH NHÂN</Title>
      <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="dob">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Giới tính" name="gender">
        <Radio.Group>
          <Radio value="Nam">Nam</Radio>
          <Radio value="Nữ">Nữ</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="PID" name="pid">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="SID" name="sid">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone">
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Title level={4}>THÔNG TIN LÂM SÀNG</Title>
      <Form.Item label="Triệu chứng chính" name="symptom">
        <TextArea />
      </Form.Item>
      <Form.Item label="Thời gian diễn biến" name="duration">
        <Select>
          <Select.Option value="<1 tuần">&lt; 1 tuần</Select.Option>
          <Select.Option value="<1 tháng">&lt; 1 tháng</Select.Option>
          <Select.Option value="<3 tháng">&lt; 3 tháng</Select.Option>
          <Select.Option value=">3 tháng">&gt; 3 tháng</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Chẩn đoán xác định" name="diagnosis">
        <Input />
      </Form.Item>
      <Form.Item label="Phương pháp điều trị" name="treatment">
        <Input />
      </Form.Item>
      <Form.Item label="Ngày bắt đầu điều trị" name="treatmentStart">
        <DatePicker />
      </Form.Item>

      <Title level={4}>THÔNG TIN BÁC SỸ CHỈ ĐỊNH</Title>
      <Form.Item label="Bác sỹ chỉ định" name="doctor">
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại bác sỹ" name="doctorPhone">
        <Input />
      </Form.Item>

      <Title level={4}>THÔNG TIN YÊU CẦU</Title>
      <Form.Item label="Yêu cầu">
        <p>
          Đánh giá đáp ứng điều trị u gan trên phim chụp cắt lớp vi tính (MSCT)
          theo tiêu chuẩn RECIST1.1
        </p>
      </Form.Item>
      <Form.Item label="Ngày thực hiện" name="executionDate">
        <DatePicker />
      </Form.Item>
      <Form.Item label="Nơi thực hiện" name="location">
        <Input />
      </Form.Item>
      <Form.Item label="Bộ phận thăm khám" name="department">
        <Input />
      </Form.Item>
      <Form.Item label="Tiêm thuốc đối quang" name="contrast">
        <Radio.Group>
          <Radio value="Có">Có</Radio>
          <Radio value="Không">Không</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Kỹ thuật kèm theo" name="technique">
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Gửi thông tin
        </Button>
      </Form.Item>
    </Form>
  );
};

export default function Template() {
  return (
    <div>
      <h2>
        KẾT QUẢ PHÂN TÍCH DỮ LIỆU CHỤP CẮT LỚP VI TÍNH ĐÁNH GIÁ THEO TIÊU CHUẨN
        RECIST 1.1
      </h2>
      <PatientForm />
      <TargetLesionsTable />
      <Link to="/">Quay lại Trang chủ</Link>
    </div>
  );
}
