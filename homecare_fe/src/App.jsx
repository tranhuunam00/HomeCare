import "./App.css";
import Home from "./pages/home";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
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
import LIRADSForm from "./pages/advance/Lirad/LIRADSForm";
import ORADSModalityOnly from "./pages/advance/oRADS/OradsForm";
import FormVer2 from "./pages/formver2/Test";
import DFormVer2 from "./pages/formver2/FormVer2";
import FormVer2List from "./pages/formver2/list/FormVer2List";
import DoctorChooseForm from "./pages/doctor_use_form_ver2/DoctorChooseForm";
import FormVer2NameList from "./pages/formver2/name/FormVer2NameList";
import DoctorUseDFormVer2 from "./pages/doctor_use_form_ver2/use/DoctorIUseFormVer2";
import DoctorUseFormVer2List from "./pages/doctor_use_form_ver2/list/DoctorUseFormVer2List";
import API_CALL from "./services/axiosClient";
import { useGlobalAuth } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import OnboardingWizard from "./components/OnboardingWizard/OnboardingWizard";
import SubscriptionPage from "./pages/packages/SubscriptionPage";
import PackageRequestsList from "./pages/packages/packageRequests/PackageRequestsList";
import UserPackagesList from "./pages/packages/userPackages/UserPackagesList";
import { getUsablePackageCodes } from "./constant/permission";
import { USER_ROLE } from "./constant/app";
import STORAGE from "./services/storage";
import PrivacyPolicy from "./components/policy/PrivacyPolicy";
import PartnerList from "./pages/intergrate/partners/partnersList";
import UltrasoundBungForm from "./pages/sono/details/bung/sono.bung";
import SonoList from "./pages/sono/list/SonoList";
import DFormVer3 from "./pages/formver3/FormVer3";
import FormVer3List from "./pages/formver3/list/FormVer3List";
import ForgotPasswordPage from "./pages/authentication/ForgotPasswordPage";

function App() {
  useAuthInitializer();
  const {
    user,
    doctor,
    printTemplateGlobal,
    userPackages,
    setNotifications,
    setUnreadCount,
  } = useGlobalAuth();
  const [wizardOpen, setWizardOpen] = useState(false);

  console.log("userPackages", userPackages);
  const isProfileIncomplete = (doc) => {
    if (!doc) return true;
    return (
      !doc.full_name ||
      !doc.dob ||
      !doc.gender ||
      !doc.phone_number ||
      !doc.id_clinic ||
      !doc.avatar_url ||
      !doc.signature_url
    );
  };

  useEffect(() => {
    if (!user) return;

    const token = STORAGE.get("TOKEN");
    if (!token) return;

    const socket = io(
      import.meta.env.VITE_API_SOCKET_URL || "http://localhost:3001/socket",
      {
        auth: { token },
      }
    );

    socket.on("connect", () => {
      console.log("✅ Connected to Socket:", socket.id);
    });

    socket.on("notification:new", (data) => {
      toast.info(`${data.title}\n${data.message}`, {
        position: "bottom-right",
      });
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => (prev || 0) + 1);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (
      doctor &&
      user?.id_role != USER_ROLE.ADMIN &&
      (isProfileIncomplete(doctor) ||
        !printTemplateGlobal?.length ||
        !getUsablePackageCodes(userPackages).length)
    ) {
      console.log("hehehe");
      setWizardOpen(true);
    } else {
      setWizardOpen(false);
    }
  }, [doctor, printTemplateGlobal, userPackages]);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomeCareLanding />} />
        <Route path="/" element={<HomeCareLanding />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientTablePage />} />
          <Route path="tirad" element={<TiradsForm />} />
          <Route path="lungrad" element={<LungRADSForm />} />
          <Route path="birad" element={<BiradsForm />} />
          <Route path="boneage" element={<BoneAgeForm />} />
          <Route path="dipss" element={<DipssForm />} />
          <Route path="D-COR" element={<FraminghamForm />} />
          <Route path="D-CPS" element={<ChildPughForm />} />
          <Route path="D-BALTHAZA" element={<ModifiedCTSIForm />} />
          <Route path="D-VOTHAN" element={<AASTKidneyForm />} />
          <Route path="D-VOGAN" element={<AASTLiverForm />} />
          <Route path="D-BOSNIAK" element={<BosniakForm />} />
          <Route path="D-LIRADS" element={<LIRADSForm />} />
          <Route path="D-ORADS" element={<ORADSModalityOnly />} />
          <Route path="tirads_nn" element={<TiradPage />} />
          <Route path="recist_nn" element={<Recist />} />
          <Route path="products" element={<ProductList />} />
          <Route path="templates" element={<TemplateList />} />
          <Route path="partners" element={<PartnerList />} />
          <Route
            path="sono/use/patient-diagnose/:patient_diagnose_id"
            element={<UltrasoundBungForm />}
          />
          <Route path="sono/bung/:id" element={<UltrasoundBungForm />} />
          <Route path="sono/bung" element={<UltrasoundBungForm />} />
          <Route path="sono/list" element={<SonoList />} />

          <Route
            path="form-drad/use/detail/:id"
            element={<DoctorUseDFormVer2 isUse={true} />}
          />
          <Route
            path="form-drad/use/patient-diagnose/:patient_diagnose_id"
            element={<DoctorUseDFormVer2 isUse={true} />}
          />
          <Route
            path="form-drad/use"
            element={<DoctorUseDFormVer2 isUse={true} />}
          />
          <Route
            path="doctor-use-form-drad/detail/:id"
            element={<DoctorUseDFormVer2 isUse={true} />}
          />

          <Route
            path="doctor-use-form-drad"
            element={<DoctorUseFormVer2List />}
          />

          <Route path="form-drad/detail/:id" element={<DFormVer2 />} />
          <Route path="form-drad-v3/detail/:id" element={<DFormVer3 />} />

          <Route path="form-drad" element={<DFormVer2 />} />
          <Route path="form-drad-v3" element={<DFormVer3 />} />

          <Route path="form-drad-list" element={<FormVer2List />} />
          <Route path="form-drad-list-v3" element={<FormVer3List />} />

          <Route path="form-ver2-names" element={<FormVer2NameList />} />
          <Route
            path="form-ver3-names"
            element={<FormVer2NameList version="v.3" />}
          />

          <Route path="form-choose-form/:id" element={<DoctorChooseForm />} />

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

          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="package-request" element={<PackageRequestsList />} />
          <Route path="package-user" element={<UserPackagesList />} />
        </Route>
      </Routes>
      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        doctorId={doctor?.id}
        API={API_CALL}
      />
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
