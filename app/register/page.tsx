import RegistrationForm from "../components/RegistrationForm";
import Navbar from "../components/Navbar";

export default function RegisterPage() {
  return (
    <>
      <Navbar active="register" />
      <div className="h-16" />
      <RegistrationForm />
    </>
  );
}
