import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import AppContext from "./assets/components/AppContext";
import { fetchAPI } from "./assets/service/api";
import Login from "./assets/components/Login";
import Register from "./assets/components/Register";
import HomeUser from "./assets/components/HomeUser";
import UserProfile from "./assets/components/UserProfile";
import Cart from "./assets/components/Cart";
import MyCourses from "./assets/components/MyCourses";
import MyOrder from "./assets/components/MyOrder";
import OrderDetail from "./assets/components/OrderDetail";
import CoursesWithQueryString from "./assets/components/CoursesWithQueryString";
import DetailCourse from "./assets/components/DetailCourse";
import HomeAdmin from "./assets/components/HomeAdmin";
import QuanLyDanhMuc from "./assets/components/QuanLyDanhMuc";
import QuanLyKhoaHoc from "./assets/components/QuanLyKhoaHoc";
import QuanLyNguoiDung from "./assets/components/QuanLyNguoiDung";
import QuanLyDonHang from "./assets/components/QuanLyDonHang";
export const url = "http://localhost:3000";

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(`${url}/me`, {
      credentials: "include", //Cho phép gửi kèm cookie
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ data }) => {
        setIsLogin(true);
        setUser(data);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  }, [refresh]); //Khi giá trị refresh thay đổi useEffect sẽ được gọi lại
  useEffect(() => {
    fetchAPI({ url: `${url}/category`, setData: setCategories });
  }, [refresh]);
  useEffect(() => {
    fetchAPI({ url: `${url}/course`, setData: setCourses });
  }, [refresh]);
  useEffect(() => {
    fetchAPI({ url: `${url}/user`, setData: setUsers });
  }, [refresh]);
  useEffect(() => {
    fetchAPI({ url: `${url}/order`, setData: setOrders });
  }, [refresh]);
  return (
    <>
      <AppContext.Provider
        value={{
          user,
          setUser,
          isLogin,
          setIsLogin,
          categories,
          courses,
          setCourses,
          users,
          setUsers,
          orders,
          setOrders,
          refresh,
          setRefresh,
        }}
      >
        <Routes>
          <Route path="/" element={<HomeUser></HomeUser>} />
          <Route path="/login" element={<Login></Login>} />
          <Route path="/register" element={<Register></Register>} />
          <Route path="/course" element={<DetailCourse></DetailCourse>} />
          <Route
            path="/courses/category"
            element={<CoursesWithQueryString text="Khóa học theo danh mục" />}
          />
          <Route
            path="/courses/search"
            element={
              <CoursesWithQueryString text="Khóa học theo từ khóa tìm kiếm" />
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-orders" element={<MyOrder />} />
          <Route path="/my-orders/detail" element={<OrderDetail />} />
          <Route path="/admin" element={<HomeAdmin></HomeAdmin>} />
          <Route path="/admin/category" element={<QuanLyDanhMuc />} />
          <Route path="/admin/course" element={<QuanLyKhoaHoc />} />
          <Route path="/admin/user" element={<QuanLyNguoiDung />} />
          <Route path="/admin/order" element={<QuanLyDonHang />} />
          <Route path="/admin/order/detail" element={<OrderDetail />} />
        </Routes>
        <ToastContainer position="top-center" autoClose={1000}></ToastContainer>
      </AppContext.Provider>
    </>
  );
}

export default App;
