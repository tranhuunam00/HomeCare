import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {" "}
      HOME
      <Link to="/template">Đi tới trang RECIST</Link>
      <div></div>
      <Link to="/tirads">Đi tới trang TIRAD</Link>
    </div>
  );
}
