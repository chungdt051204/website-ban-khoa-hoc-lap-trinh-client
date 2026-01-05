import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import Footer from "./Footer";
import "./components-css/OrderDetail.css";

export default function OrderDetail({ component }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { refresh, setRefresh, user, isLoading } = useContext(AppContext);
  const [orderWithOrderId, setOrderWithOrderId] = useState("");
  const [orderItemSelected, setOrderItemSelected] = useState(null);
  const dialog = useRef();
  const getRemainingAmount = (value) => {
    return value?.coursePrice - value?.appliedAmount;
  };

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      if (id) {
        fetchAPI({
          url: `${url}/order?order_id=${id}`,
          setData: setOrderWithOrderId,
        });
      }
    } else navigate("/");
  }, [id, refresh, navigate, user, isLoading]);
  //Hàm mở popup dialog
  const handleOpenDialog = (value) => {
    setOrderItemSelected(value);
    dialog.current.showModal();
  };
  //Hàm xác nhận thanh toán 50% còn lại
  const handleConfirmRemainingPayment = () => {
    if (user) {
      fetch(`${url}/order`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          orderId: id,
          orderItemId: orderItemSelected?._id,
          courseId: orderItemSelected?.courseId?._id,
          remainingAmount: getRemainingAmount(orderItemSelected),
        }),
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
          console.log(message);
        });
    }
  };
  return (
    <div className="page-layout">
      {component}
      <div className="main-content">
        <div className="order-detail-container">
          <div className="order-detail-header">
            <h2>Chi tiết đơn hàng</h2>
          </div>
          {orderWithOrderId && (
            <>
              <div
                className={
                  orderWithOrderId.status === "Đã hoàn thành"
                    ? "order-status-completed"
                    : "order-status-uncompleted"
                }
              >
                Trạng thái: {orderWithOrderId.status}
              </div>
              {orderWithOrderId.fullName && (
                <div className="order-detail-info">
                  <h3>Thông tin khách hàng</h3>
                  <p>
                    <strong>Họ tên:</strong> {orderWithOrderId.fullName}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {orderWithOrderId.phone}
                  </p>
                </div>
              )}
              <table className="order-detail-table">
                <thead>
                  <tr>
                    <th>Khóa học</th>
                    <th>Giá</th>
                    <th>Đã thanh toán</th>
                    <th>Còn lại</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orderWithOrderId?.items?.map((value) => {
                    const image = value.courseId.image.includes("https")
                      ? value.courseId.image
                      : `${url}/images/course/${value.courseId.image}`;
                    return (
                      <tr key={value._id}>
                        <td className="order-detail-course-cell">
                          <img
                            src={image}
                            className="order-detail-course-image"
                          />
                          <div className="order-detail-course-info">
                            <p className="order-detail-course-name">
                              {value.courseName}
                            </p>
                          </div>
                        </td>
                        <td className="order-detail-price">
                          {value.coursePrice} VNĐ
                        </td>
                        <td style={{ color: "#28a745", fontWeight: "bold" }}>
                          {value.appliedAmount} VNĐ
                        </td>
                        <td style={{ color: "#6c757d", fontWeight: "bold" }}>
                          {getRemainingAmount(value) + " " + "VNĐ"}
                        </td>
                        <td>
                          {value.coursePrice > value.appliedAmount && (
                            <button
                              className="pay-remain__btn"
                              onClick={() => handleOpenDialog(value)}
                            >
                              Thanh toán 50% còn lại
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="order-detail-total">
                Tổng cộng: {orderWithOrderId.totalAmount} VNĐ
              </div>
            </>
          )}
        </div>
      </div>
      <dialog ref={dialog} className="confirm-dialog">
        <h3 className="dialog-title">Thông báo xác nhận</h3>
        <form method="dialog" className="dialog-content">
          <p className="dialog-message">
            Bạn có muốn thanh toán nốt{" "}
            <span style={{ fontWeight: "bold" }}>
              {getRemainingAmount(orderItemSelected) + " " + "VNĐ"}
            </span>{" "}
            cho khóa học này không?
          </p>

          <div className="dialog-actions">
            <button
              onClick={handleConfirmRemainingPayment}
              className="btn btn-confirm"
              value="confirm"
            >
              Xác nhận
            </button>
            <button
              onClick={() => {
                dialog.current.close();
              }}
              className="btn btn-cancel"
              value="cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      </dialog>
      <Footer />
    </div>
  );
}
