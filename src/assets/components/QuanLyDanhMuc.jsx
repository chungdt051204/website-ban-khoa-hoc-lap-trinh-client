import { Link, useSearchParams } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import AdminNavBar from "./AdminNavBar";
import Footer from "./Footer";
import "./components-css/QuanLyDanhMuc.css";

export default function QuanLyDanhMuc() {
  const { categories, setRefresh } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const addDialog = useRef();
  const updateDialog = useRef();
  const addDialogValue = useRef();
  const updateDialogValue = useRef();
  const [err, setErr] = useState("");
  const [categoryWithId, setCategoryWithId] = useState("");

  //Hàm xử lý chức năng thêm danh mục
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (addDialogValue.current.value === "") {
      setErr("Vui lòng nhập tên danh mục muốn thêm");
      return;
    }
    fetch(`${url}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: addDialogValue.current.value }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        addDialog.current.close();
        setRefresh((prev) => prev + 1);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  };
  //Hàm xử lý bấm vào icon cây bút hiện popup dialog chứa thông tin danh mục được chọn
  const handleClickUpdate = (id) => {
    fetchAPI({ url: `${url}/category?id=${id}`, setData: setCategoryWithId });
    updateDialog.current.showModal();
  };
  //Hàm xử lý chức năng sửa danh mục
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    fetch(`${url}/category?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ title: updateDialogValue.current.value }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        toast.success(message);
        updateDialog.current.close();
        setRefresh((prev) => prev + 1);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  };
  //Hàm xử lý chức năng xóa danh mục
  const handleDelete = (id) => {
    fetch(`${url}/category?id=${id}`, {
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
      <section>
        <AdminNavBar />
        <div style={{ margin: "50px" }}>
          <button
            className="btn-add-category"
            onClick={() => {
              addDialog.current.showModal();
            }}
          >
            + Thêm danh mục
          </button>
          <table className="category-table" border={1}>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th colSpan={2}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((value) => {
                return (
                  <tr key={value._id}>
                    <td>{value.title}</td>
                    <td>
                      <Link to={`/admin/category?id=${value._id}`}>
                        <i
                          style={{ color: "blue" }}
                          onClick={() => handleClickUpdate(value._id)}
                          className="fa-solid fa-pen"
                        ></i>
                      </Link>
                    </td>
                    <td>
                      <i
                        style={{ color: "red" }}
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
        <dialog ref={addDialog}>
          <h2>Thêm danh mục</h2>
          <form method="dialog" onSubmit={handleAddSubmit}>
            <input
              type="text"
              ref={addDialogValue}
              placeholder="Nhập tên danh mục muốn thêm"
            />
            {err && <p>{err}</p>}
            <button>Thêm</button>
          </form>
        </dialog>
        <dialog ref={updateDialog}>
          <h2>Sửa danh mục</h2>
          <form method="dialog" onSubmit={handleUpdateSubmit}>
            <input
              type="text"
              ref={updateDialogValue}
              defaultValue={categoryWithId !== "" ? categoryWithId.title : ""}
            />
            {err && <p>{err}</p>}
            <button>Sửa</button>
          </form>
        </dialog>
        <Footer />
      </section>
    </>
  );
}
