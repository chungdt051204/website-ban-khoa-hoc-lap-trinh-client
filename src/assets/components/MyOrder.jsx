import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "./AppContext";
import Footer from "./Footer";
import UserNavBar from "./UserNavBar";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import "./components-css/MyOrder.css";

export default function MyOrder() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status");
  const { user, refresh, isLoading } = useContext(AppContext);
  const [myOrders, setMyOrders] = useState([]);
  const [statusSelected, setStatusSelected] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      const params = new URLSearchParams();
      params.append("user_id", user._id);
      if (status) params.append("status", status);
      fetchAPI({
        url: `${url}/order?${params.toString()}`,
        setData: setMyOrders,
      });
    } else navigate("/");
  }, [user, refresh, status, navigate, isLoading]);
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
    <div className="page-layout">
      <UserNavBar />
      <div className="main-content">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h2>Đơn hàng của tôi</h2>
          </div>
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
          {myOrders.length > 0 ? (
            <table className="my-orders-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày mua</th>
                  <th>Tổng tiền</th>
                  <th>Đã thanh toán</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((value) => {
                  return (
                    <tr key={value._id}>
                      <td className="my-orders-order-id">{value._id}</td>
                      <td className="my-orders-date">
                        {new Date(value.updatedAt).toLocaleDateString()} -
                        {new Date(value.updatedAt).toLocaleTimeString()}
                      </td>
                      <td className="my-orders-total">
                        {value.totalAmount + value.remainingAmount} VNĐ
                      </td>
                      <td style={{ color: "#28a745", fontWeight: "bold" }}>
                        {value.totalAmount} VNĐ
                      </td>
                      <td style={{ color: "#6c757d", fontWeight: "bold" }}>
                        {value.remainingAmount} VNĐ
                      </td>
                      <td>
                        <span
                          className={
                            value.status === "Đã hoàn thành"
                              ? "my-orders-status-completed"
                              : "my-orders-status-uncompleted"
                          }
                        >
                          {value.status}
                        </span>
                      </td>
                      <td className="my-orders-action">
                        <Link to={`/my-orders/detail?id=${value._id}`}>
                          <button>Xem chi tiết</button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="my-orders-empty">Bạn chưa có đơn hàng nào.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
