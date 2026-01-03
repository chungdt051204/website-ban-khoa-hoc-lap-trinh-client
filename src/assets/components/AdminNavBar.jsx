import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { url } from "../../App";
import "./components-css/NavBar.css";

export default function AdminNavBar() {
  const navigate = useNavigate();
  const { isLogin, setIsLogin, user } = useContext(AppContext);
  const [avatarClicked, setAvatarClicked] = useState(false);

  //Hàm xử lý chức năng đăng xuất
  const handleLogout = () => {
    setIsLogin(false);
    fetch(`${url}/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        navigate("/");
      });
  };
  return (
    <>
      <nav className="navbar">
        <Link to="">
          <div className="logo">
            <img src="/rocket-icon.svg" alt="Logo" />
          </div>
        </Link>
        <ul className="menu">
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/category">
              <p>Quản lý danh mục</p>
            </Link>
          </li>
          <li>
            <Link to="/admin/course">
              <p>Quản lý khóa học</p>
            </Link>
          </li>
          <li>
            <Link to="/admin/user">
              <p>Quản lý người dùng</p>
            </Link>
          </li>
          <li>
            <Link to="/admin/order">
              <p>Quản lý đơn hàng</p>
            </Link>
          </li>
          <li className="nav-user-item">
            {isLogin ? (
              <div className="user-dropdown">
                <div
                  className="user-trigger"
                  onClick={() => setAvatarClicked((prev) => !prev)}
                >
                  <img
                    src={
                      user?.avatar?.includes("https")
                        ? user.avatar
                        : `${url}/images/user/${user?.avatar}`
                    }
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="user-avatar"
                  />
                  <i
                    className={`fa-solid fa-angle-${
                      avatarClicked ? "up" : "down"
                    } icon-arrow`}
                  ></i>
                </div>
                {avatarClicked && (
                  <div className="user-dropdown-menu">
                    <Link to="/profile" className="menu-link">
                      <i className="fa-regular fa-user"></i> Thông tin cá nhân
                    </Link>
                    <hr />
                    <div className="menu-link logout" onClick={handleLogout}>
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>{" "}
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                Đăng nhập
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}
