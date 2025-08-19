import CompanyRegistrationForm from "../components/CompanyRegistrationForm";
import Navbar from "../components/Navbar";

export default function RegisterCompanyPage() {
  return (
    <>
      <Navbar active="register-company" />
      <div className="h-16" />
      <CompanyRegistrationForm />
    </>
  );
}
