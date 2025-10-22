import { Tag } from "antd";

export const APPROVAL_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const approvalStatusTag = (status) => {
  switch (status) {
    case APPROVAL_STATUS.APPROVED:
      return <Tag color="green">Đã duyệt</Tag>;
    case APPROVAL_STATUS.REJECTED:
      return <Tag color="red">Từ chối</Tag>;
    case APPROVAL_STATUS.DRAFT:
    default:
      return <Tag color="gold">Nháp</Tag>;
  }
};
