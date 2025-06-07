import "./App.css";
import Home from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TiradPage from "./pages/tirads";
import LoginForm from "./pages/authentication/LoginForm";
import { ToastContainer } from "react-toastify";
import Recist from "./pages/recist";
import Profile from "./pages/profile/Profile";
import ProductList from "./pages/products/ProductsList";
import AccountPage from "./pages/account/AccountPage";
import MyWallet from "./pages/wallets/MyWallet";
import PaymentScreen from "./pages/payments/PaymentScreen";
import CustomerList from "./pages/customers/CustomerList";
import OrderList from "./pages/orders/OrderList";
import StaffPage from "./pages/staff/StaffPage";
import HomeCareLanding from "./pages/landingpage/HomeCareLanding";
import RegisterForm from "./pages/authentication/RegisterForm";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ClinicList from "./pages/clinics/ClinicList";
import useAuthInitializer from "./hooks/useAuthInitializer";

function App() {
  useAuthInitializer();
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomeCareLanding />} />

        <Route path="/home" element={<Home />}>
          <Route index element={<ProductList />} />
          <Route path="tirads" element={<TiradPage />} />
          <Route path="products" element={<ProductList />} />
          <Route path="recist" element={<Recist />} />
          <Route path="profile" element={<Profile />}></Route>
          <Route path="account" element={<AccountPage />} />
          <Route path="wallet" element={<MyWallet />} />
          <Route path="payments" element={<PaymentScreen />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="staffs" element={<StaffPage />} />
          <Route path="clinics" element={<ClinicList />} />
        </Route>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<HomeCareLanding />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
