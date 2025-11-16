import React, { useState } from "react";
import { Select, InputNumber, Button, Table, Card, Row, Col } from "antd";
import { STRUCTURE_OPTIONS } from "./bung.constants";

const UltrasoundBungForm = () => {
  const [structure, setStructure] = useState(null);
  const [status, setStatus] = useState(null);
  const [position, setPosition] = useState(null);
  const [size, setSize] = useState(null);

  const [list, setList] = useState([]);

  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  let recognition;

  if ("webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "vi-VN";
  }

  const startVoice = () => {
    if (!recognition) {
      alert("Trình duyệt không hỗ trợ Speech Recognition!");
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setVoiceText(text);
      setList((prev) => [...prev, { text }]); // thêm vào cuối danh sách
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const handleAdd = () => {
    if (!structure || !status || !position) return;

    const item = {
      structure,
      status,
      position,
      size: size ? `${size} mm` : null,
      text: `${structure} – ${status} – ${position}${
        size ? ` – (${size} mm)` : ""
      }`,
    };

    setList([...list, item]);

    // Reset
    setStatus(null);
    setPosition(null);
    setSize(null);
  };

  const statusOptions = structure ? STRUCTURE_OPTIONS[structure].status : [];
  const positionOptions = structure
    ? STRUCTURE_OPTIONS[structure].position
    : [];

  const needSize =
    structure && STRUCTURE_OPTIONS[structure].needSize.includes(status || "");

  return (
    <Card title="Mô tả hình ảnh siêu âm">
      {/* ======= 1 HÀNG – 4 CỘT ======= */}
      <Row gutter={12}>
        {/* Field 2 */}
        <Col xs={24} md={6}>
          <label>
            <b>Field 2 – Cấu trúc</b>
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={structure}
            onChange={(v) => {
              setStructure(v);
              setStatus(null);
              setPosition(null);
              setSize(null);
            }}
            options={Object.keys(STRUCTURE_OPTIONS).map((k) => ({
              label: k,
              value: k,
            }))}
          />
        </Col>

        {/* Field 3 */}
        <Col xs={24} md={6}>
          <label>
            <b>Field 3 – Trạng thái</b>
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPosition(null);
              setSize(null);
            }}
            options={statusOptions.map((s) => ({ label: s, value: s }))}
            disabled={!structure}
          />
        </Col>

        {/* Field 4 */}
        <Col xs={24} md={6}>
          <label>
            <b>Field 4 – Vị trí</b>
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={position}
            onChange={(v) => setPosition(v)}
            options={positionOptions.map((p) => ({ label: p, value: p }))}
            disabled={!status}
          />
        </Col>

        {/* Field 5 */}
        <Col xs={24} md={6}>
          <label>
            <b>Field 5 – Kích thước (mm)</b>
          </label>
          {needSize ? (
            <InputNumber
              style={{ width: "100%" }}
              value={size}
              min={1}
              onChange={(v) => setSize(v)}
              placeholder="mm"
            />
          ) : (
            <InputNumber
              style={{ width: "100%" }}
              disabled
              placeholder="Không yêu cầu"
            />
          )}
        </Col>
      </Row>

      {/* Nút thêm */}
      <Button
        type="primary"
        block
        style={{ marginTop: 16 }}
        disabled={!structure || !status || !position}
        onClick={handleAdd}
      >
        Thêm vào danh sách
      </Button>

      <Button
        type={isRecording ? "primary" : "default"}
        danger={isRecording}
        block
        onClick={startVoice}
        style={{ marginTop: 16 }}
      >
        {isRecording ? "Đang nghe..." : "🎤 Ghi âm giọng nói"}
      </Button>

      {/* Danh sách kết quả */}
      <Card title="Hình ảnh siêu âm" style={{ marginTop: 24 }}>
        {list.map((item, idx) => (
          <p key={idx}>• {item.text}</p>
        ))}

        {list.length === 0 && <i>Chưa có mô tả nào.</i>}
        {list.length === 0 && <i>Chưa có voice nào.</i>}
      </Card>
    </Card>
  );
};

export default UltrasoundBungForm;
