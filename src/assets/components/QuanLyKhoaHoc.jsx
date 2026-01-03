import { Link, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import AdminNavBar from "./AdminNavBar";
import PriceFilter from "./PriceFilter";
import CategoryFilter from "./CategoryFilter";
import Footer from "./Footer";
import "./components-css/QuanLyKhoaHoc.css";

export default function QuanLyKhoaHoc() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, setCourses, categories, refresh, setRefresh } =
    useContext(AppContext);
  const id = searchParams.get("id");
  const search = searchParams.get("search");
  const category_id = searchParams.get("category_id");
  const priceRange = searchParams.get("price");
  const addDialog = useRef();
  const updateDialog = useRef();
  const [courseWithId, setCourseWithId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [categorySelected, setCategorySelected] = useState("");
  const [priceSelected, setPriceSelected] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const addImage = useRef();
  const updateImage = useRef();
  const addThumbnail = useRef();
  const updateThumbnail = useRef();
  const [errTitle, setErrTitle] = useState("");
  const [errCategory, setErrCategory] = useState("");
  const [errPrice, setErrPrice] = useState("");
  const [errFile, setErrImage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append("search", encodeURIComponent(search));
    if (category_id) params.append("category_id", category_id);
    if (priceRange) params.append("price", priceRange);
    fetchAPI({
      url: `${url}/course?${params.toString()}`,
      setData: setCourses,
    });
    setSearchValue("");
  }, [refresh, setCourses, category_id, search, priceRange]);
  //Hàm xử lý chức năng tìm kiếm khóa học
  const handleClickSearch = () => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (searchValue) nextParams.set("search", searchValue);
      else nextParams.delete("search");
      return nextParams;
    });
  };
  //Hàm xử lý chọn danh mục
  const handleCategoryChange = (value) => {
    setCategorySelected(value);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value) nextParams.set("category_id", value);
      else nextParams.delete("category_id");
      return nextParams;
    });
  };
  //Hàm xử lý chọn giá
  const handlePriceChange = (value) => {
    setPriceSelected(value);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value) nextParams.set("price", value);
      else nextParams.delete("price");
      return nextParams;
    });
  };
  //Hàm xử lý chức năng thêm khóa học
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (title === "") {
      setErrTitle("Vui lòng nhập tên khóa học");
      return;
    } else if (categorySelected == 0) {
      setErrCategory("Bạn chưa chọn danh mục");
      return;
    } else if (price === "") {
      setErrPrice("Vui lòng nhập giá");
      return;
    } else if (!addImage.current.files[0] || !addThumbnail.current.files[0]) {
      setErrImage("Bạn chưa chọn file");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("categoryId", categorySelected);
    formData.append("price", price);
    formData.append("image", addImage.current.files[0]);
    formData.append("thumbnail", addThumbnail.current.files[0]);
    fetch(`${url}/course`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        setRefresh((prev) => prev + 1);
        addDialog.current.close();
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  };
  //Hàm xử lý chức năng sửa khóa học
  const handleClickUpdate = (id) => {
    fetchAPI({ url: `${url}/course?id=${id}`, setData: setCourseWithId });
    updateDialog.current.showModal();
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("categoryId", categorySelected);
    formData.append("price", price);
    formData.append("image", updateImage.current.files[0]);
    formData.append("thumbnail", updateThumbnail.current.files[0]);
    fetch(`${url}/course?id=${id}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        setRefresh((prev) => prev + 1);
        updateDialog.current.close();
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  };
  //Hàm xử lý chức năng xóa khóa học
  const handleDelete = (id) => {
    fetch(`${url}/course?id=${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        setRefresh((prev) => prev + 1);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        toast.error(message);
      });
  };
  return (
    <>
      <AdminNavBar />
      <div>
        <div className="course-controls">
          <button
            className="add-course-btn"
            onClick={() => {
              addDialog.current.showModal();
            }}
          >
            Thêm khóa học
          </button>
          <div className="search-wrapper">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClickSearch();
              }}
              className="course-search-input"
              placeholder="Tìm khóa học"
            />
            <button
              type="button"
              className="search-btn"
              onClick={handleClickSearch}
              aria-label="Tìm"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
          <CategoryFilter
            selectedValue={categorySelected}
            onCategoryChange={handleCategoryChange}
          />
          <PriceFilter
            selectedValue={priceSelected}
            onPriceChange={handlePriceChange}
          />
        </div>
        <h3 style={{ marginLeft: "30px" }}>Tổng khóa học: {courses.length}</h3>
        <div className="course-table-container">
          <table>
            <thead>
              <tr>
                <th className="course-col">Khóa học</th> <th>Danh mục</th>
                <th className="course-col">Giá</th>
                <th className="action-col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses?.map((value, index) => {
                const image = value.image.includes("https")
                  ? value.image
                  : `${url}/images/course/${value.image}`;
                const isSelected = index === 0 ? "selected" : "";
                return (
                  <tr key={index} className={isSelected}>
                    <td className="course-title-cell">
                      <img
                        src={image}
                        alt=""
                        className="course-img"
                        width={50}
                        height={50}
                      />
                      <span className="course-name">{value.title}</span>
                    </td>
                    <td style={{ fontWeight: "500" }}>
                      {value.categoryId.title}
                    </td>
                    <td className="price-cell">
                      {value.price > 0 ? `${value.price}` : "Miễn phí"}
                    </td>
                    <td className="action-cell">
                      <Link to={`/admin/course?id=${value._id}`}>
                        <i
                          onClick={() => handleClickUpdate(value._id)}
                          className="fa-solid fa-pen"
                        ></i>
                      </Link>
                      <i
                        onClick={() => handleDelete(value._id)}
                        className="fa-solid fa-trash"
                      ></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <dialog ref={addDialog}>
        <h2>Thêm khóa học</h2>
        <form action="" method="dialog" onSubmit={handleAddSubmit}>
          <input
            type="text"
            onChange={(e) => {
              setTitle(e.target.value);
              setErrTitle("");
            }}
            placeholder="Nhập tên khóa học"
          />
          {errTitle && <span>{errTitle}</span>}
          <br />
          <select
            className="form-select"
            onChange={(e) => {
              setCategorySelected(e.target.value);
              setErrCategory("");
            }}
          >
            <option value="0">Chọn danh mục</option>
            {categories?.map((value, index) => {
              return (
                <option key={index} value={value._id}>
                  {value.title}
                </option>
              );
            })}
          </select>
          <br />
          {errCategory && <span>{errCategory}</span>}
          <input
            onChange={(e) => {
              setPrice(e.target.value);
              setErrPrice("");
            }}
            type="text"
            placeholder="Nhập giá"
          />
          {errPrice && <span>{errPrice}</span>}
          Image:
          <div className="avatar-group">
            <input
              type="file"
              name="image"
              ref={addImage}
              className="custom-file-input"
              accept=".jpg, .jpeg, .png"
            />
          </div>
          Thumbnail:
          <div className="avatar-group">
            <input
              type="file"
              name="image"
              ref={addThumbnail}
              className="custom-file-input"
              accept=".jpg, .jpeg, .png"
            />
          </div>
          {errFile && <span>{errFile}</span>}
          <button>Thêm</button>
        </form>
      </dialog>
      <dialog ref={updateDialog}>
        <h2>Sửa khóa học</h2>
        <form action="" method="dialog" onSubmit={handleUpdateSubmit}>
          <input
            type="text"
            onChange={(e) => {
              setTitle(e.target.value);
              setErrTitle("");
            }}
            defaultValue={courseWithId.title}
          />
          <select
            className="form-select"
            onChange={(e) => {
              setCategorySelected(e.target.value);
              setErrCategory("");
            }}
          >
            <option value={courseWithId ? courseWithId.categoryId._id : ""}>
              {courseWithId ? courseWithId.categoryId.title : "Chọn danh mục"}
            </option>
            {categories.length > 0 &&
              categories.map((value, index) => {
                return (
                  <option key={index} value={value._id}>
                    {value.title}
                  </option>
                );
              })}
          </select>
          <br />
          <input
            onChange={(e) => {
              setPrice(e.target.value);
              setErrPrice("");
            }}
            type="text"
            defaultValue={courseWithId.price}
          />
          Image:
          <div className="avatar-group">
            <input
              type="file"
              name="image"
              ref={updateImage}
              className="custom-file-input"
              accept=".jpg, .jpeg, .png"
            />
          </div>
          Thumbnail:
          <div className="avatar-group">
            <input
              type="file"
              name="image"
              ref={updateThumbnail}
              className="custom-file-input"
              accept=".jpg, .jpeg, .png"
            />
          </div>
          <br />
          <button>Cập nhật</button>
        </form>
      </dialog>
      <Footer />
    </>
  );
}
