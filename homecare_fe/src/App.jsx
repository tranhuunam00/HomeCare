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
import ProtectedRoute from "./ProtectedRoute";
import TemplateList from "./pages/products/TemplatesList/TemplateList";
import AddOrEditTemplateProduct from "./pages/products/TemplateProduct/AddTemplateProduct";
import TemplatePrintList from "./pages/products/TemplatePrint/TemplatePrintList/TemplatePrintList";
import TemplatePrintPreview from "./pages/products/TemplatePrintPage/TemplatePrintPage";
import TemplatePrintUse from "./pages/products/TemplatePrintUse/TemplatePrintUse";
import DoctorPrintTemplateList from "./pages/products/DoctorUseTemplate/DoctorUseTemplate";
import PatientTablePage from "./pages/patient/PatientDiagnoseList";
import PatientFormPage from "./pages/patient/New/PatientFormPage";
import PatientDiagnoseDetailPage from "./pages/patient/Detail/DetailPatientDiagnose";
import PatientUseTemplate from "./pages/patient/Use/PatientUseTemplate";
import ViewTemplateProduct from "./pages/products/TemplateProduct/ViewTemplateProduct";
import TemplateServiceList from "./pages/template_service/TemplateServiceList";
import ExamPartList from "./pages/template_service/ExamPart/ExamPartList";
import TiradsForm from "./pages/advance/Tirad/TiradsForm";
import LungRADSForm from "./pages/advance/LungRADS/LungRadForm";
import BiradsForm from "./pages/advance/BIRADS/BiradsForm";
import BoneAgeForm from "./pages/advance/BONEAGE/BoneAgeForm";
import DipssForm from "./pages/advance/D-IPSS/DipssForm";
import FraminghamForm from "./pages/advance/Framingham/FraminghamForm";
import ChildPughForm from "./pages/advance/D-CPS/ChildPughForm";
import ContactForm from "./pages/contacts/ContactForm";
import ContactAdminList from "./pages/contacts/list/ContactList";
import ModifiedCTSIForm from "./pages/advance/CTSI/CtsiForm";
import AASTKidneyForm from "./pages/advance/AASTKidneyForm/AASTKidneyForm";
import AASTLiverForm from "./pages/advance/AASTLiverForm/AASTLiverForm";
import BosniakForm from "./pages/advance/BosniakForm/BosniakForm";

function App() {
  useAuthInitializer();
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomeCareLanding />} />
        <Route path="/" element={<HomeCareLanding />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/tirad" element={<TiradsForm />} />
        <Route path="/lungrad" element={<LungRADSForm />} />
        <Route path="/birad" element={<BiradsForm />} />
        <Route path="/boneage" element={<BoneAgeForm />} />
        <Route path="/dipss" element={<DipssForm />} />
        <Route path="/D-COR" element={<FraminghamForm />} />
        <Route path="/D-CPS" element={<ChildPughForm />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/D-BALTHAZA" element={<ModifiedCTSIForm />} />
        <Route path="/D-VOTHAN" element={<AASTKidneyForm />} />
        <Route path="/D-VOGAN" element={<AASTLiverForm />} />
        <Route path="/D-BOSNIAK" element={<BosniakForm />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientTablePage />} />
          <Route path="tirads" element={<TiradPage />} />

          <Route path="products" element={<ProductList />} />
          <Route path="templates" element={<TemplateList />} />
          <Route
            path="/home/templates/add"
            element={<AddOrEditTemplateProduct />}
          />
          <Route
            path="/home/templates/edit/:id"
            element={<AddOrEditTemplateProduct />}
          />
          <Route path="template_services" element={<TemplateServiceList />} />
          <Route path="exam-parts" element={<ExamPartList />} />

          <Route
            path="/home/templates/view/:id"
            element={<ViewTemplateProduct />}
          />

          <Route path="templates-print" element={<TemplatePrintList />} />
          <Route
            path="templates-print/edit/:id_print_template"
            element={<TemplatePrintPreview />}
          />
          <Route
            path="templates-print/create"
            element={<TemplatePrintPreview />}
          />
          <Route path="doctor-used" element={<DoctorPrintTemplateList />} />
          <Route
            path="templates-print/use/:id_print_template"
            element={<TemplatePrintUse />}
          />
          <Route path="recist" element={<Recist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:idDoctor" element={<Profile />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="wallet" element={<MyWallet />} />
          <Route path="payments" element={<PaymentScreen />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="staffs" element={<StaffPage />} />
          <Route path="clinics" element={<ClinicList />} />
          <Route path="contacts-admin" element={<ContactAdminList />} />

          <Route path="patients-diagnose" element={<PatientTablePage />} />
          <Route
            path="patients-diagnose/create"
            element={<PatientFormPage />}
          />
          <Route
            path="patients-diagnose/use/:id_patient_diagnose"
            element={<PatientUseTemplate />}
          />
          <Route
            path="patients-diagnose/edit/:id"
            element={<PatientFormPage />}
          />
          <Route
            path="patients-diagnose/:id"
            element={<PatientDiagnoseDetailPage />}
          />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
