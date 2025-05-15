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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginForm />} />

        <Route path="/home" element={<Home />}>
          <Route index element={<Profile />} />
          <Route path="tirads" element={<TiradPage />} />
          <Route path="products" element={<ProductList />} />
          <Route path="recist" element={<Recist />} />
          <Route path="profile" element={<Profile />}></Route>
          <Route path="account" element={<AccountPage />} />
          <Route path="wallet" element={<MyWallet />} />
          <Route path="payment" element={<PaymentScreen />} />
        </Route>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
