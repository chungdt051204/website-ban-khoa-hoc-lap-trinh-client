import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppContext from "./AppContext";
import "./components-css/QuanLyDonHang.css";
import AdminNavBar from "./AdminNavBar";
import Footer from "./Footer";
import { fetchAPI } from "../service/api";
import { url } from "../../App";

function QuanLyDonHang() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status");
  const { orders, setOrders, refresh, user, isLoading } =
    useContext(AppContext);
  const [statusSelected, setStatusSelected] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (user && user?.role === "admin") {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      fetchAPI({
        url: `${url}/order?${params.toString()}`,
        setData: setOrders,
      });
    } else navigate("/");
  }, [refresh, status, setOrders, user, navigate, isLoading]);
  //Hàm xử lý chọn trạng thái đơn hàng
  const handleStatusSelected = (value) => {
    setStatusSelected(value);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (value) nextParams.set("status", value);
      else nextParams.delete("status");
      return nextParams;
    });
  };
  return (
    <>
      <AdminNavBar />
      <div className="quanly-donhang" style={{ margin: "50px" }}>
        <select
          value={statusSelected}
          onChange={(e) => handleStatusSelected(e.target.value)}
          className="role-select"
          style={{ marginBottom: "20px" }}
        >
          <option value="">Chọn trạng thái</option>
          <option value="Chưa hoàn thành">Chưa hoàn thành</option>
          <option value="Đã hoàn thành">Đã hoàn thành</option>
        </select>
        <table className="order-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Người mua</th>
              <th>Số điện thoại</th>
              <th>Phương thức thanh toán</th>
              <th>Ngày mua</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((value) => {
              return (
                <tr key={value._id}>
                  <td className="font-code">{value._id}</td>
                  <td>{value.fullName}</td>
                  <td>{value.phone}</td>
                  <td>{value.paymentMethod}</td>
                  <td>
                    {new Date(value.createdAt).toLocaleDateString()} -
                    {new Date(value.createdAt).toLocaleTimeString()}
                  </td>
                  <td style={{ color: "red" }} className="font-bold">
                    {value.totalAmount} VNĐ
                  </td>
                  <td
                    className={
                      value.status === "Chưa hoàn thành"
                        ? "status-uncompleted"
                        : "status-completed"
                    }
                  >
                    <span>{value.status}</span>
                  </td>
                  <td>
                    <Link
                      to={`/admin/order/detail?id=${value._id}`}
                      className="order-detail-link"
                    >
                      <button className="btn-detail-sm">Xem chi tiết</button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}
export default QuanLyDonHang;
