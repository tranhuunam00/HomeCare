import BackHeader from "../../../components/BackHeader";

export const ThamKhaoLinkHomeCare = ({ link }) => {
  return (
    <div>
      <BackHeader
        title="Quay lại"
        sticky
        // extra={<Button type="primary">Lưu</Button>}
      />
      <h5>
        <a href={link || "https://home-care.vn/product/phan-mem-d-tirads/"}>
          Tham khảo tại Home-care.vn
        </a>
      </h5>
    </div>
  );
};
