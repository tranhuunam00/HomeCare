import React from "react";
import { Table, Card, Row, Col, Tag } from "antd";

const ImportResult = ({ data }) => {
  if (!data) return null;

  const validColumns = [
    { title: "Excel Row", dataIndex: "excelRow" },
    { title: "PID", dataIndex: "PID" },
    { title: "SID", dataIndex: "SID" },
    { title: "Name", dataIndex: "name" },
    { title: "Gender", dataIndex: "gender" },
    { title: "Phone", dataIndex: "phoneNumber" },
    { title: "Province", dataIndex: "province_name" },
    { title: "Ward", dataIndex: "ward_name" },
    { title: "Exam Part", dataIndex: "exam_part_name" },
  ];

  const invalidColumns = [
    { title: "Row", dataIndex: "row" },
    { title: "PID", dataIndex: "PID" },
    {
      title: "Errors",
      dataIndex: "errors",
      render: (errors) =>
        errors?.map((err, index) => (
          <Tag key={index} color="red">
            {err}
          </Tag>
        )),
    },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      {/* Summary */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <b>Tổng:</b> {data.totalRows}
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <b style={{ color: "green" }}>Dòng Hợp Lệ:</b> {data.validCount}
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <b style={{ color: "red" }}>Dòng Lỗi:</b> {data.invalidCount}
          </Card>
        </Col>
      </Row>

      {/* Invalid table */}
      <Card title="Data lỗi" style={{ marginTop: 20 }}>
        <Table
          columns={invalidColumns}
          dataSource={data.invalidRows}
          rowKey="row"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ImportResult;
