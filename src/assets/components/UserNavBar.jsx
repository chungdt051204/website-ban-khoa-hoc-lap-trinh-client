import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import "./components-css/NavBar.css";

export default function UserNavBar() {
  const navigate = useNavigate();
  const { user, isLogin, setIsLogin, categories, setRefresh } =
    useContext(AppContext);
  const [isHovered, setIsHovered] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [coursesWithSearchSuggestion, setCoursesWithSearchSuggestion] =
    useState([]);
  //Hàm xử lý chức năng hiển thị gợi ý tìm kiếm
  const handleChange = (value) => {
    setInputValue(value);
    fetchAPI({
      url: `${url}/course/search/suggestion?search=${encodeURIComponent(
        value
      )}`,
      setData: setCoursesWithSearchSuggestion,
    });
  };
  //Hàm xử lý chức năng đăng xuất
  const handleLogout = () => {
    fetch(`${url}/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        setIsLogin(false);
        setRefresh((prev) => prev + 1);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
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
          <li></li>
          <li>
            <Link to="/">Trang chủ</Link>
          </li>
          <li>
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="categories-dropdown"
            >
              <Link>
                <p>Danh mục</p>
              </Link>
              {isHovered && (
                <div className="categories-dropdown-menu">
                  {categories?.map((value) => {
                    return (
                      <div className="categories-dropdown-item" key={value._id}>
                        <Link to={`/courses/category?category_id=${value._id}`}>
                          <p>{value.title}</p>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
          <li>
            <i
              onClick={() => {
                if (!isLogin) {
                  toast.warning("Bạn chưa đăng nhập");
                  return;
                } else {
                  navigate("/cart");
                }
              }}
              className="fa-solid fa-cart-shopping"
              style={{ cursor: "pointer" }}
            ></i>
          </li>
          <li className="search">
            <div className="search-dropdown">
              <div className="search-box">
                <input
                  value={inputValue}
                  onChange={(e) => handleChange(e.target.value)}
                  type="text"
                  placeholder="Nhập tên khóa học..."
                />
                <Link
                  to={`/courses/search?search=${encodeURIComponent(
                    inputValue
                  )}`}
                >
                  <i
                    style={{ cursor: "pointer" }}
                    className="fa-solid fa-magnifying-glass"
                  ></i>
                </Link>
              </div>
              {inputValue !== "" && (
                <div className="search-dropdown-menu">
                  {coursesWithSearchSuggestion.length > 0 ? (
                    coursesWithSearchSuggestion.map((value, index) => {
                      const image = value.image.includes("https")
                        ? value.image
                        : `${url}/images/course/${value.image}`;
                      return (
                        <Link to={`/course?id=${value._id}`}>
                          <div className="search-dropdown-item" key={index}>
                            <img src={image} alt="" width={60} height={80} />
                            <p>{value.title}</p>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p>Không tìm thấy khóa học để hiển thị</p>
                  )}
                </div>
              )}
            </div>
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
                      user.avatar.includes("https")
                        ? user.avatar
                        : `${url}/images/user/${user.avatar}`
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
                    <Link to="/my-courses" className="menu-link">
                      <i className="fa-solid fa-graduation-cap"></i> Khóa học
                      của tôi
                    </Link>
                    <Link to="/my-orders" className="menu-link">
                      <i className="fa-solid fa-receipt"></i> Đơn hàng của tôi
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
