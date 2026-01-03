import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import AdminNavBar from "./AdminNavBar";
import Footer from "./Footer";
import "./components-css/QuanLyNguoiDung.css";

export default function QuanLyNguoiDung() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role");
  const { users, setUsers, refresh, setRefresh } = useContext(AppContext);
  const [roleSelected, setRoleSelected] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    fetchAPI({ url: `${url}/user?${params.toString()}`, setData: setUsers });
  }, [refresh, setUsers, role]);
  //Hàm xử lý chọn vai trò
  const handleRoleSelected = (value) => {
    setRoleSelected(value);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value) nextParams.set("role", value);
      else nextParams.delete("role");
      return nextParams;
    });
  };
  //Hàm xử lý cập nhật trạng thái người dùng
  const handleSetStatusUser = (user) => {
    const status = user.status === "active" ? "banned" : "active";
    fetch(`${url}/user/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        console.log(message);
        setRefresh((prev) => prev + 1);
      })
      .catch(async (err) => {
        const { message } = await err.json();
        console.log(message);
      });
  };
  //Hàm xử lý xóa người dùng
  const handleDelete = (id) => {
    fetch(`${url}/user/${id}`, {
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
      <section className="user-management" style={{ margin: "50px" }}>
        <select
          value={roleSelected}
          onChange={(e) => handleRoleSelected(e.target.value)}
          className="role-select"
          style={{ marginBottom: "20px" }}
        >
          <option value="">Chọn vai trò</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th className="table-header">Username</th>
                <th className="table-header">Email</th>
                <th className="table-header">Vai trò</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header action-column">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((value) => {
                return (
                  <tr key={value._id} className="table-row">
                    <td>{value.username}</td>
                    <td>{value.email}</td>
                    <td>{value.role}</td>
                    <td>
                      <p
                        style={{
                          color: value.status === "banned" ? "red" : "green",
                        }}
                      >
                        {value.status}
                      </p>
                    </td>
                    <td className="action-column">
                      {value.role === "admin" ? (
                        ""
                      ) : (
                        <button
                          onClick={() => handleSetStatusUser(value)}
                          className={`action-btn ${
                            value.status === "banned"
                              ? "action-reactivate"
                              : "action-deactivate"
                          }`}
                        >
                          {value.status === "banned"
                            ? "Hủy vô hiệu hóa"
                            : "Vô hiệu hóa"}
                        </button>
                      )}
                      {value.role === "admin" ? (
                        ""
                      ) : (
                        <button
                          onClick={() => handleDelete(value._id)}
                          className="action-btn action-delete"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <Footer />
    </>
  );
}
