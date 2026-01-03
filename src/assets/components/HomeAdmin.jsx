import Footer from "./Footer";
import AdminNavBar from "./AdminNavBar";
import DashBoard from "./Dashboard";

export default function HomeAdmin() {
  return (
    <>
      <AdminNavBar></AdminNavBar>
      <DashBoard />
      <Footer />
    </>
  );
}
