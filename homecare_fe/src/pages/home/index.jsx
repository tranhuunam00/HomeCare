import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {" "}
      HOME
      <Link to="/template">Đi tới trang Biểu mẫu</Link>
    </div>
  );
}
