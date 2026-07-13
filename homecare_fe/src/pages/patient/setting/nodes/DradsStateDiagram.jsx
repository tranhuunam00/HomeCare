import React, { useState } from "react";
import { Button } from "antd";

const WORKFLOW_STATES = {
  n_unread: {
    title: "Chưa đọc",
    badge: "Trạng thái bắt đầu",
    color: "var(--color-unread)",
    desc: "Ca bệnh mới được đồng bộ từ HIS hoặc nhập thủ công vào hệ thống. Đang nằm trong hàng đợi của worklist, chờ bác sĩ nhận đọc.",
    transitions: [
      { name: "Chọn đọc luôn", to: "Đang đọc", desc: "Bác sĩ trực tiếp bấm vào ca bệnh và mở giao diện đọc kết quả." },
      { name: "Chọn bác sĩ hội chẩn", to: "Hội chẩn", desc: "Chuyển ca bệnh đến hội đồng bác sĩ chuyên khoa hoặc bác sĩ cấp cao hơn để thảo luận." }
    ],
    upgrades: [
      "Bổ sung cơ chế tự động phân bổ: Dựa vào loại ca (siêu âm, X-quang) và tải của từng bác sĩ để chỉ định tự động ca chưa đọc.",
      "Đồng bộ tự động trạng thái hủy tiếp nhận từ HIS để làm sạch danh sách chờ."
    ]
  },
  n_consult: {
    title: "Hội chẩn",
    badge: "Trạng thái hỗ trợ",
    color: "var(--color-consult)",
    desc: "Ca bệnh khó đang được thảo luận bởi các bác sĩ. Không ai được phép sửa nội dung phiếu ngoài những người được giao hội chẩn.",
    transitions: [
      { name: "Chọn đọc", to: "Đang đọc", desc: "Bác sĩ được chỉ định chính bắt đầu nhập kết quả sau khi đã thống nhất ý kiến hội chẩn." }
    ],
    upgrades: [
      "Tích hợp chatroom và chia sẻ hình ảnh trực tiếp thời gian thực (Real-time DICOM viewer) để tăng tốc độ hội chẩn trực tuyến."
    ]
  },
  n_reading: {
    title: "Đang đọc",
    badge: "Trạng thái chỉnh sửa",
    color: "var(--color-reading)",
    desc: "Bác sĩ chẩn đoán hình ảnh đang nhập mô tả kết quả, kết luận và chọn hình ảnh in ấn. Hệ thống liên tục tự động lưu nháp.",
    transitions: [
      { name: "Lưu đọc", to: "Đang đọc (Bản nháp)", desc: "Lưu tạm thông tin để có thể quay lại đọc tiếp sau đó." },
      { name: "Đọc xong", to: "Đọc xong", desc: "Hoàn tất việc điền kết quả và gửi lên hệ thống chờ phê duyệt." },
      { name: "Hủy tiếp nhận", to: "Chưa đọc", desc: "Huỷ bỏ việc nhận đọc ca bệnh này, trả kết quả về trạng thái Chưa đọc (Mới) chờ bác sĩ khác nhận." },
      { name: "Duyệt (Trực tiếp)", to: "Duyệt", desc: "Nếu bác sĩ chẩn đoán có quyền duyệt ca (quy trình 1 cấp - Auto Approve), ca sẽ được duyệt luôn." }
    ],
    upgrades: []
  },
  n_done: {
    title: "Đọc xong",
    badge: "Trạng thái sẵn sàng duyệt",
    color: "var(--color-done)",
    desc: "Phiếu kết quả đã hoàn thành. Ca bệnh được đẩy vào tab 'Chờ duyệt'. Bác sĩ đọc không thể chỉnh sửa kết quả trừ khi yêu cầu sửa lại.",
    transitions: [
      { name: "Sửa đọc", to: "Đang đọc", desc: "Bác sĩ đọc tự thu hồi phiếu kết quả để sửa lại khi chưa có ai phê duyệt." },
      { name: "Nhận duyệt", to: "Đang duyệt", desc: "Bác sĩ duyệt hoặc Trưởng khoa khóa ca bệnh để tiến hành rà soát." }
    ],
    upgrades: [
      "Báo động đỏ (Red Alert): Tự động đánh dấu hoặc gửi thông báo SMS/Zalo cho bác sĩ duyệt khi có các kết quả khẩn cấp."
    ]
  },
  n_reviewing: {
    title: "Đang duyệt",
    badge: "Trạng thái rà soát",
    color: "var(--color-reviewing)",
    desc: "Ca bệnh được mở bởi người có thẩm quyền phê duyệt. Phiếu kết quả đang được kiểm tra câu chữ và tính đúng đắn của chẩn đoán.",
    transitions: [
      { name: "Lưu duyệt", to: "Đang duyệt (Nháp)", desc: "Người duyệt lưu tạm ý kiến hoặc bản chỉnh sửa nháp." },
      { name: "Duyệt xong", to: "Duyệt", desc: "Ký số phê duyệt phiếu kết quả, sẵn sàng xuất bản và trả kết quả." },
      { name: "Hủy nhận duyệt", to: "Đọc xong", desc: "Từ chối duyệt ca hoặc trả lại phiếu để bác sĩ tự sửa kết quả." }
    ],
    upgrades: [
      "Bổ sung nút 'Yêu cầu sửa lại' kèm theo note lý do lỗi cụ thể để phản hồi nhanh cho người đọc."
    ]
  },
  n_approved: {
    title: "Duyệt",
    badge: "Trạng thái cuối cùng",
    color: "var(--color-approved)",
    desc: "Kết quả đã được ký số chính thức. Phiếu được gửi tự động đến người bệnh qua SMS/Zalo/Webportal và đồng bộ dữ liệu chẩn đoán về HIS của bệnh viện.",
    transitions: [
      { name: "Sửa duyệt", to: "Đang duyệt", desc: "Trường hợp phát hiện sai sót sau khi đã ký duyệt, cần chỉnh sửa lại." },
      { name: "Hủy duyệt", to: "Đọc xong", desc: "Hủy bỏ chữ ký số để đưa kết quả về lại trạng thái chờ duyệt ban đầu." }
    ],
    upgrades: [
      "Tự động khóa hoàn toàn sau 24h: Ngăn chặn tuyệt đối việc hủy duyệt hoặc sửa duyệt sau khi kết quả đã được gửi đi lâu để đảm bảo tính pháp lý."
    ]
  }
};

const WORKFLOW_TRANSITIONS = {
  t_unread_reading: { title: "Chọn đọc luôn", from: "Chưa đọc", to: "Đang đọc", desc: "Chuyển dịch khi bác sĩ chủ động nhận ca trên worklist để đọc." },
  t_unread_consult: { title: "Chọn bác sĩ hội chẩn", from: "Chưa đọc", to: "Hội chẩn", desc: "Trường hợp ca bệnh được đánh dấu cần hội ý chuyên môn trước khi đưa ra kết quả." },
  t_consult_reading: { title: "Chọn đọc", from: "Hội chẩn", to: "Đang đọc", desc: "Chuyển tiếp sau khi buổi hội chẩn kết thúc để bác sĩ chính ghi kết quả." },
  t_reading_unread: { title: "Hủy tiếp nhận", from: "Đang đọc", to: "Chưa đọc", desc: "Huỷ bỏ việc nhận đọc ca bệnh này, đưa ca bệnh quay về trạng thái Mới (Chưa đọc) chờ người khác nhận." },
  t_reading_done: { title: "Đọc xong", from: "Đang đọc", to: "Đọc xong", desc: "Chuyển tiếp phiếu kết quả lên hàng đợi phê duyệt của trưởng khoa." },
  t_done_reading: { title: "Sửa đọc", from: "Đọc xong", to: "Đang đọc", desc: "Bác sĩ đọc tự thu hồi phiếu kết quả để sửa lại khi chưa có ai phê duyệt." },
  t_done_reviewing: { title: "Nhận duyệt", from: "Đọc xong", to: "Đang duyệt", desc: "Người phê duyệt khóa ca để bắt đầu thực hiện rà soát kết quả." },
  t_reviewing_approved: { title: "Duyệt xong", from: "Đang duyệt", to: "Duyệt", desc: "Ký chữ ký số để xuất bản phiếu kết quả và đồng bộ dữ liệu." },
  t_reading_approved: { title: "Duyệt (Trực tiếp)", from: "Đang đọc", to: "Duyệt", desc: "Quy trình một cấp dành cho các ca bệnh thường quy hoặc bác sĩ có thẩm quyền cao tự thực hiện cả hai vai trò." },
  t_approved_reviewing: { title: "Sửa duyệt", from: "Duyệt", to: "Đang duyệt", desc: "Chuyển về rà soát lại để chỉnh sửa một số nội dung nhỏ trong phiếu đã duyệt." },
  t_approved_done: { title: "Hủy duyệt", from: "Duyệt", to: "Đọc xong", desc: "Rút lại quyết định ký duyệt, đẩy ca về hàng chờ duyệt lại từ đầu." },
  t_reading_self: { title: "Lưu đọc", from: "Đang đọc", to: "Đang đọc (Lưu nháp)", desc: "Tự động hoặc chủ động lưu lại bản phác thảo kết quả chẩn đoán." },
  t_reviewing_self: { title: "Lưu duyệt", from: "Đang duyệt", to: "Đang duyệt (Nháp)", desc: "Lưu tạm các chỉnh sửa, ghi chú sửa đổi của người duyệt trước khi ký số." },
  u_reading_consult: { title: "Yêu cầu hội chẩn", from: "Đang đọc", to: "Hội chẩn", desc: "Đề xuất mới: Cho phép yêu cầu hội chẩn giữa chừng ngay trong lúc đang đọc nếu phát hiện bất thường nghiêm trọng ngoài tầm xử lý." },
  t_reviewing_done: { title: "Hủy nhận duyệt", from: "Đang duyệt", to: "Đọc xong", desc: "Huỷ bỏ việc nhận duyệt, trả kết quả về trạng thái Đọc xong để người đọc có thể chủ động sửa đổi." },
  u_reviewing_reading: { title: "Trả ca / Yêu cầu sửa", from: "Đang duyệt", to: "Đang đọc", desc: "Đề xuất mới: Người duyệt từ chối duyệt ca và gửi yêu cầu bác sĩ đọc chỉnh sửa lại kèm theo note lý do lỗi cụ thể." }
};

const DradsStateDiagram = () => {
  const [svgUpgradeMode, setSvgUpgradeMode] = useState(true);
  const [selectedSvgId, setSelectedSvgId] = useState(null);

  const selectedData = selectedSvgId
    ? (selectedSvgId.startsWith("n_")
      ? WORKFLOW_STATES[selectedSvgId]
      : WORKFLOW_TRANSITIONS[selectedSvgId])
    : null;

  return (
    <div className={`drads-state-diagram ${svgUpgradeMode ? "upgrade-active" : ""}`}>
      <style>{`
        .drads-state-diagram {
          --bg-color: #0b0b14;
          --panel-bg: rgba(20, 20, 35, 0.6);
          --border-color: rgba(255, 255, 255, 0.08);
          --text-main: #f3f4f6;
          --text-muted: #9ca3af;
          
          --color-unread: #3b82f6;
          --color-consult: #a855f7;
          --color-reading: #f59e0b;
          --color-done: #06b6d4;
          --color-reviewing: #6366f1;
          --color-approved: #10b981;
          --color-cancelled: #ef4444;
          --color-upgrade: #ec4899;

          background-color: var(--bg-color);
          color: var(--text-main);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          margin-top: 30px;
        }

        .drads-state-diagram .diagram-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(11, 11, 20, 0.4);
        }

        .drads-state-diagram .main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          height: 600px;
        }

        .drads-state-diagram .canvas-container {
          position: relative;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.005) 0%, transparent 100%);
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .drads-state-diagram .canvas-svg {
          width: 1300px;
          height: 600px;
          user-select: none;
          background: rgba(255,255,255,0.002);
        }

        .drads-state-diagram .detail-panel {
          background: var(--panel-bg);
          border-left: 1px solid var(--border-color);
          backdrop-filter: blur(20px);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          height: 100%;
        }

        .drads-state-diagram .panel-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .drads-state-diagram .panel-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .drads-state-diagram .badge {
          font-size: 0.7rem;
          padding: 3px 6px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
          display: inline-block;
        }

        .drads-state-diagram .panel-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .drads-state-diagram .section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
        }

        .drads-state-diagram .text-body {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #d1d5db;
        }

        .drads-state-diagram .node-rect {
          fill: rgba(20, 20, 30, 0.8);
          stroke-width: 1.5;
          rx: 14;
          ry: 14;
          cursor: pointer;
          transition: all 0.3s;
        }

        .drads-state-diagram .node-rect:hover {
          filter: brightness(1.2) drop-shadow(0 4px 12px currentColor);
        }

        .drads-state-diagram .node-rect.selected {
          stroke-width: 3;
          filter: brightness(1.3) drop-shadow(0 6px 20px currentColor);
        }

        .drads-state-diagram .node-text {
          font-size: 14px;
          font-weight: 500;
          fill: #fff;
          pointer-events: none;
          text-anchor: middle;
          dominant-baseline: middle;
        }

        .drads-state-diagram .flow-line {
          fill: none;
          stroke-width: 2;
          stroke-dasharray: 6 4;
          animation: flow 30s linear infinite;
          transition: all 0.3s;
          cursor: pointer;
        }

        .drads-state-diagram .flow-line:hover {
          stroke-width: 4.5;
        }

        .drads-state-diagram .flow-line.selected {
          stroke-width: 4;
          stroke-dasharray: none;
          animation: none;
        }

        .drads-state-diagram .line-text-bg {
          fill: #0b0b14;
          rx: 4;
          ry: 4;
        }

        .drads-state-diagram .line-text {
          font-size: 11px;
          font-weight: 500;
          fill: #9ca3af;
          cursor: pointer;
          text-anchor: middle;
          dominant-baseline: middle;
          transition: fill 0.3s;
        }

        .drads-state-diagram .line-text:hover {
          fill: #fff;
        }

        @keyframes flow {
          from { stroke-dashoffset: 500; }
          to { stroke-dashoffset: 0; }
        }

        .drads-state-diagram .upgrade-element {
          opacity: 0.15;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .drads-state-diagram.upgrade-active .upgrade-element {
          opacity: 1;
          pointer-events: auto;
        }

        .drads-state-diagram .transition-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .drads-state-diagram .transition-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.85rem;
        }

        .drads-state-diagram .transition-item-title {
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
          display: flex;
          justify-content: space-between;
        }

        .drads-state-diagram .upgrade-badge-inline {
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.3);
          color: #ec4899;
          font-size: 0.65rem;
          padding: 1px 4px;
          border-radius: 8px;
        }

        .drads-state-diagram .recommendation-card {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(168, 85, 247, 0.08));
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
        }

        .drads-state-diagram .recommendation-card h4 {
          color: #ec4899;
          margin-bottom: 6px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .drads-state-diagram .recommendation-card li {
          font-size: 0.8rem;
          color: #e5e7eb;
          margin-left: 12px;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .drads-state-diagram .grid-pattern {
          fill: none;
          stroke: rgba(255, 255, 255, 0.015);
          stroke-width: 1;
        }
      `}</style>

      <div className="diagram-header">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff", margin: 0 }}>Sơ đồ Trạng thái Quy trình Báo cáo D-RADS</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sơ đồ máy trạng thái (State Machine) tương tác</span>
        </div>
      </div>

      <div className="main-grid" onClick={() => setSelectedSvgId(null)}>
        {/* Canvas */}
        <div className="canvas-container">
          <svg className="canvas-svg" viewBox="0 0 1300 600" onClick={(e) => e.stopPropagation()}>
            <defs>
              <pattern id="grid-pattern-svg" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" className="grid-pattern" />
              </pattern>
              <marker id="arrow-svg" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
              </marker>
              <marker id="arrow-selected-svg" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" />
              </marker>
              <marker id="arrow-upgrade-svg" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-pattern-svg)" />

            {/* TRANSITIONS */}
            <g>
              {/* 1. Chưa đọc -> Đang đọc (Chọn đọc luôn) */}
              <path
                id="t_unread_reading"
                d="M 230 200 L 450 200"
                className={`flow-line ${selectedSvgId === "t_unread_reading" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_unread_reading" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_unread_reading" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_unread_reading")}
              />

              {/* 2. Chưa đọc -> Hội chẩn (Chọn bác sĩ hội chẩn) */}
              <path
                id="t_unread_consult"
                d="M 155 240 Q 155 350 230 400"
                className={`flow-line ${selectedSvgId === "t_unread_consult" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_unread_consult" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_unread_consult" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_unread_consult")}
              />

              {/* 3. Hội chẩn -> Đang đọc (Chọn đọc) */}
              <path
                id="t_consult_reading"
                d="M 370 425 Q 480 425 500 240"
                className={`flow-line ${selectedSvgId === "t_consult_reading" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_consult_reading" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_consult_reading" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_consult_reading")}
              />

              {/* 4. Đang đọc -> Chưa đọc (Hủy tiếp nhận) */}
              <path
                id="t_reading_unread"
                d="M 450 170 Q 340 100 230 170"
                className={`flow-line ${selectedSvgId === "t_reading_unread" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reading_unread" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reading_unread" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reading_unread")}
              />

              {/* 5. Đang đọc -> Đọc xong (Đọc xong) */}
              <path
                id="t_reading_done"
                d="M 590 200 L 730 200"
                className={`flow-line ${selectedSvgId === "t_reading_done" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reading_done" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reading_done" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reading_done")}
              />

              {/* 6. Đọc xong -> Đang đọc (Sửa đọc) */}
              <path
                id="t_done_reading"
                d="M 730 170 Q 660 100 590 170"
                className={`flow-line ${selectedSvgId === "t_done_reading" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_done_reading" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_done_reading" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_done_reading")}
              />

              {/* 7. Đọc xong -> Đang duyệt (Nhận duyệt) */}
              <path
                id="t_done_reviewing"
                d="M 870 200 L 970 200"
                className={`flow-line ${selectedSvgId === "t_done_reviewing" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_done_reviewing" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_done_reviewing" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_done_reviewing")}
              />

              {/* 8. Đang duyệt -> Duyệt (Duyệt xong) */}
              <path
                id="t_reviewing_approved"
                d="M 1110 200 L 1190 200"
                className={`flow-line ${selectedSvgId === "t_reviewing_approved" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reviewing_approved" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reviewing_approved" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reviewing_approved")}
              />

              {/* 9. Đang đọc -> Duyệt (Duyệt thẳng - 1 Cấp) */}
              <path
                id="t_reading_approved"
                d="M 520 240 Q 860 380 1190 230"
                className={`flow-line ${selectedSvgId === "t_reading_approved" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reading_approved" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reading_approved" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reading_approved")}
              />

              {/* 10. Duyệt -> Đang duyệt (Sửa duyệt) */}
              <path
                id="t_approved_reviewing"
                d="M 1210 160 Q 1150 90 1090 160"
                className={`flow-line ${selectedSvgId === "t_approved_reviewing" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_approved_reviewing" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_approved_reviewing" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_approved_reviewing")}
              />

              {/* 11. Duyệt -> Đọc xong (Hủy duyệt) */}
              <path
                id="t_approved_done"
                d="M 1250 160 Q 1040 -10 800 160"
                className={`flow-line ${selectedSvgId === "t_approved_done" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_approved_done" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_approved_done" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_approved_done")}
              />

              {/* Loop 12: Đang đọc -> Đang đọc (Lưu đọc) */}
              <path
                id="t_reading_self"
                d="M 480 240 C 470 300 550 300 540 240"
                className={`flow-line ${selectedSvgId === "t_reading_self" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reading_self" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reading_self" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reading_self")}
              />

              {/* Loop 13: Đang duyệt -> Đang duyệt (Lưu duyệt) */}
              <path
                id="t_reviewing_self"
                d="M 1000 160 C 970 90 1070 90 1040 160"
                className={`flow-line ${selectedSvgId === "t_reviewing_self" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reviewing_self" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reviewing_self" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reviewing_self")}
              />

              {/* 14. Đang duyệt -> Đọc xong (Hủy nhận duyệt) */}
              <path
                id="t_reviewing_done"
                d="M 970 230 Q 885 270 800 240"
                className={`flow-line ${selectedSvgId === "t_reviewing_done" ? "selected" : ""}`}
                stroke={selectedSvgId === "t_reviewing_done" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "t_reviewing_done" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("t_reviewing_done")}
              />

              {/* ================= UPGRADE PATHS ================= */}
              {/* U1. Đang đọc -> Hội chẩn (Yêu cầu hội chẩn giữa chừng) */}
              <path
                id="u_reading_consult"
                d="M 470 240 Q 320 320 320 390"
                className={`flow-line ${selectedSvgId === "u_reading_consult" ? "selected" : ""}`}
                stroke={selectedSvgId === "u_reading_consult" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "u_reading_consult" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("u_reading_consult")}
              />

              {/* U2. Đang duyệt -> Đang đọc (Trả ca / Yêu cầu sửa) */}
              <path
                id="u_reviewing_reading"
                d="M 1040 240 Q 780 380 520 240"
                className={`flow-line ${selectedSvgId === "u_reviewing_reading" ? "selected" : ""}`}
                stroke={selectedSvgId === "u_reviewing_reading" ? "#fff" : "#9ca3af"}
                markerEnd={selectedSvgId === "u_reviewing_reading" ? "url(#arrow-selected-svg)" : "url(#arrow-svg)"}
                onClick={() => setSelectedSvgId("u_reviewing_reading")}
              />
            </g>

            {/* TRANSITION LABELS */}
            <g>
              {/* 1. Chọn đọc luôn */}
              <rect x="300" y="188" width="80" height="20" className="line-text-bg" />
              <text x="340" y="198" className="line-text" onClick={() => setSelectedSvgId("t_unread_reading")}>Chọn đọc luôn</text>

              {/* 2. Chọn bác sĩ hội chẩn */}
              <rect x="75" y="310" width="115" height="20" className="line-text-bg" />
              <text x="132" y="320" className="line-text" onClick={() => setSelectedSvgId("t_unread_consult")}>Chọn bác sĩ hội chẩn</text>

              {/* 3. Chọn đọc */}
              <rect x="385" y="380" width="60" height="20" className="line-text-bg" />
              <text x="415" y="390" className="line-text" onClick={() => setSelectedSvgId("t_consult_reading")}>Chọn đọc</text>

              {/* 4. Hủy tiếp nhận */}
              <rect x="300" y="105" width="80" height="20" className="line-text-bg" />
              <text x="340" y="115" className="line-text" onClick={() => setSelectedSvgId("t_reading_unread")}>Hủy tiếp nhận</text>

              {/* 5. Đọc xong */}
              <rect x="630" y="188" width="60" height="20" className="line-text-bg" />
              <text x="660" y="198" className="line-text" onClick={() => setSelectedSvgId("t_reading_done")}>Đọc xong</text>

              {/* 6. Sửa đọc */}
              <rect x="630" y="105" width="60" height="20" className="line-text-bg" />
              <text x="660" y="115" className="line-text" onClick={() => setSelectedSvgId("t_done_reading")}>Sửa đọc</text>

              {/* 7. Nhận duyệt */}
              <rect x="885" y="188" width="70" height="20" className="line-text-bg" />
              <text x="920" y="198" className="line-text" onClick={() => setSelectedSvgId("t_done_reviewing")}>Nhận duyệt</text>

              {/* 8. Duyệt xong */}
              <rect x="1120" y="188" width="65" height="20" className="line-text-bg" />
              <text x="1152" y="198" className="line-text" onClick={() => setSelectedSvgId("t_reviewing_approved")}>Duyệt xong</text>

              {/* 9. Duyệt (Direct) */}
              <rect x="830" y="310" width="40" height="20" className="line-text-bg" />
              <text x="850" y="320" className="line-text" onClick={() => setSelectedSvgId("t_reading_approved")}>Duyệt</text>

              {/* 10. sửa duyệt */}
              <rect x="1115" y="100" width="60" height="20" className="line-text-bg" />
              <text x="1145" y="110" className="line-text" onClick={() => setSelectedSvgId("t_approved_reviewing")}>sửa duyệt</text>

              {/* 11. hủy duyệt */}
              <rect x="990" y="55" width="60" height="20" className="line-text-bg" />
              <text x="1020" y="65" className="line-text" onClick={() => setSelectedSvgId("t_approved_done")}>hủy duyệt</text>

              {/* 12. lưu đọc */}
              <rect x="480" y="280" width="50" height="20" className="line-text-bg" />
              <text x="505" y="290" className="line-text" onClick={() => setSelectedSvgId("t_reading_self")}>lưu đọc</text>

              {/* 13. lưu duyệt */}
              <rect x="980" y="100" width="60" height="20" className="line-text-bg" />
              <text x="1010" y="110" className="line-text" onClick={() => setSelectedSvgId("t_reviewing_self")}>lưu duyệt</text>

              {/* 14. Hủy nhận duyệt */}
              <rect x="840" y="240" width="100" height="20" className="line-text-bg" />
              <text x="890" y="250" className="line-text" onClick={() => setSelectedSvgId("t_reviewing_done")}>Hủy nhận duyệt</text>

              {/* UPGRADE LABELS */}
              {/* U1. Yêu cầu hội chẩn */}
              <rect x="290" y="280" width="115" height="20" className="line-text-bg" />
              <text x="347" y="290" className="line-text" onClick={() => setSelectedSvgId("u_reading_consult")}>Yêu cầu hội chẩn</text>

              {/* U2. Trả ca / Yêu cầu sửa */}
              <rect x="700" y="280" width="130" height="20" className="line-text-bg" />
              <text x="765" y="290" className="line-text" onClick={() => setSelectedSvgId("u_reviewing_reading")}>Trả ca / Yêu cầu sửa</text>
            </g>

            {/* STATES */}
            <g>
              {/* 1. Chưa đọc */}
              <g transform="translate(80, 160)" onClick={() => setSelectedSvgId("n_unread")}>
                <rect
                  width="150"
                  height="80"
                  className={`node-rect ${selectedSvgId === "n_unread" ? "selected" : ""}`}
                  stroke="var(--color-unread)"
                  fill="rgba(59, 130, 246, 0.05)"
                  style={{ color: "var(--color-unread)" }}
                />
                <text x="75" y="40" className="node-text">Chưa đọc</text>
              </g>

              {/* 2. Hội chẩn */}
              <g transform="translate(220, 390)" onClick={() => setSelectedSvgId("n_consult")}>
                <rect
                  width="150"
                  height="70"
                  className={`node-rect ${selectedSvgId === "n_consult" ? "selected" : ""}`}
                  stroke="var(--color-consult)"
                  fill="rgba(168, 85, 247, 0.05)"
                  style={{ color: "var(--color-consult)" }}
                />
                <text x="75" y="35" className="node-text">Hội chẩn</text>
              </g>

              {/* 3. Đang đọc */}
              <g transform="translate(450, 160)" onClick={() => setSelectedSvgId("n_reading")}>
                <rect
                  width="140"
                  height="80"
                  className={`node-rect ${selectedSvgId === "n_reading" ? "selected" : ""}`}
                  stroke="var(--color-reading)"
                  fill="rgba(245, 158, 11, 0.05)"
                  style={{ color: "var(--color-reading)" }}
                />
                <text x="70" y="40" className="node-text">Đang đọc</text>
              </g>

              {/* 4. Đọc xong */}
              <g transform="translate(730, 160)" onClick={() => setSelectedSvgId("n_done")}>
                <rect
                  width="140"
                  height="80"
                  className={`node-rect ${selectedSvgId === "n_done" ? "selected" : ""}`}
                  stroke="var(--color-done)"
                  fill="rgba(6, 182, 212, 0.05)"
                  style={{ color: "var(--color-done)" }}
                />
                <text x="70" y="40" className="node-text">Đọc xong</text>
              </g>

              {/* 5. Đang duyệt */}
              <g transform="translate(970, 160)" onClick={() => setSelectedSvgId("n_reviewing")}>
                <rect
                  width="140"
                  height="80"
                  className={`node-rect ${selectedSvgId === "n_reviewing" ? "selected" : ""}`}
                  stroke="var(--color-reviewing)"
                  fill="rgba(99, 102, 241, 0.05)"
                  style={{ color: "var(--color-reviewing)" }}
                />
                <text x="70" y="40" className="node-text">Đang duyệt</text>
              </g>

              {/* 6. Duyệt */}
              <g transform="translate(1190, 160)" onClick={() => setSelectedSvgId("n_approved")}>
                <rect
                  width="120"
                  height="80"
                  className={`node-rect ${selectedSvgId === "n_approved" ? "selected" : ""}`}
                  stroke="var(--color-approved)"
                  fill="rgba(16, 185, 129, 0.05)"
                  style={{ color: "var(--color-approved)" }}
                />
                <text x="60" y="40" className="node-text">Duyệt</text>
              </g>
            </g>
          </svg>
        </div>

        {/* Details Sidebar */}
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <div className="panel-header">
            <div className="panel-title">
              <span style={{ color: selectedData?.color || "#fff" }}>
                {selectedData?.title || "Quy trình D-RADS"}
              </span>
            </div>
            <span
              className="badge"
              style={{
                background: selectedData ? (selectedSvgId.startsWith("n_") ? `${selectedData.color}22` : "rgba(255,255,255,0.1)") : "rgba(255,255,255,0.1)",
                color: selectedData?.color || "#fff",
                border: selectedData && selectedSvgId.startsWith("n_") ? `1px solid ${selectedData.color}33` : "none"
              }}
            >
              {selectedData ? (selectedSvgId.startsWith("n_") ? selectedData.badge : "Hành động") : "Chung"}
            </span>
          </div>

          <div className="panel-section">
            <div className="section-title">Mô tả</div>
            <p className="text-body">
              {selectedData?.desc || "Chọn một trạng thái (khối hình chữ nhật) hoặc một hành động (nhãn trên mũi tên) để xem chi tiết nghiệp vụ và đề xuất cải tiến tối ưu hóa."}
            </p>
          </div>

          {selectedSvgId && selectedSvgId.startsWith("n_") && selectedData?.transitions?.length > 0 && (
            <div className="panel-section">
              <div className="section-title">Các chuyển dịch trạng thái tiếp theo</div>
              <div className="transition-list">
                {selectedData.transitions.map((trans, i) => (
                  <div key={i} className="transition-item">
                    <div className="transition-item-title">
                      <span>{trans.name}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}> {trans.to}</span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.4 }}>
                      {trans.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation Cards */}
          {selectedData?.upgrades?.length > 0 && (
            <div className="recommendation-card">
              <h4>Đề xuất Nâng cấp</h4>
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {selectedData.upgrades.map((upg, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: upg }}></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DradsStateDiagram;
