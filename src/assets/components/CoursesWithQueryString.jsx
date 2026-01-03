import { Link, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "./AppContext";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import UserNavBar from "./UserNavBar";
import PriceFilter from "./PriceFilter";
import Footer from "./Footer";
import "./components-css/CoursesWithQueryString.css";

export default function CoursesWithQueryString({ text }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const category_id = searchParams.get("category_id");
  const search = searchParams.get("search");
  const priceRange = searchParams.get("price");
  const { categories, refresh } = useContext(AppContext);
  const [coursesWithQueryString, setCoursesWithQueryString] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [priceSelected, setPriceSelected] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category_id) {
      params.append("category_id", category_id);
      //Lấy ra tên danh mục được chọn
      const title = categories?.map((value) => {
        if (value._id === category_id) return value.title;
      });
      setCategoryName(title);
    }
    if (search) params.append("search", search);
    if (priceRange) params.append("price", priceRange);
    fetchAPI({
      url: `${url}/course?${params.toString()}`,
      setData: setCoursesWithQueryString,
    });
  }, [
    refresh,
    category_id,
    search,
    priceRange,
    setCoursesWithQueryString,
    categories,
  ]);
  //Hàm xử lý sự kiện chọn giá
  const handlePriceChange = (value) => {
    setPriceSelected(value);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value) nextParams.set("price", value);
      else nextParams.delete("price");
      return nextParams;
    });
  };
  return (
    <>
      <UserNavBar />
      <div className="course-page">
        <div className="container">
          <PriceFilter
            selectedValue={priceSelected}
            onPriceChange={handlePriceChange}
          />
          <header className="page-header">
            <div className="header-info">
              <h1 className="page-title">
                {text}
                <span className="title-highlight">
                  {category_id ? categoryName : ""}
                </span>
              </h1>
              <p className="page-count">
                {coursesWithQueryString.length} khóa học
              </p>
            </div>
          </header>
          <div className="course-list">
            {coursesWithQueryString.length > 0 ? (
              coursesWithQueryString.map((value) => {
                const image = value.image.includes("https")
                  ? value.image
                  : `http://localhost:3000/images/course/${value.image}`;
                return (
                  <Link to={`/course?id=${value._id}`} key={value._id}>
                    <div className="course-item">
                      <div className="course-image">
                        <img
                          src={image}
                          alt={value.title}
                          width={150}
                          height={200}
                        />
                      </div>
                      <div className="course-body">
                        <h3 className="course-name">{value.title}</h3>
                        <div className="course-price">
                          {value.price > 0 ? (
                            value.price + " " + "VND"
                          ) : (
                            <span className="free">Miễn phí</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="empty">Không tìm thấy khóa học nào.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
