import { useContext, useEffect, useRef, useState } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import UserNavBar from "./UserNavBar";
import Footer from "./Footer";
import "./components-css/Cart.css";

export default function Cart() {
  const { user, refresh, setRefresh } = useContext(AppContext);
  const [myCart, setMyCart] = useState(null);
  const [cartItemIdSelected, setCartItemIdSelected] = useState([]);
  const [partialIds, setPartialIds] = useState([]);
  const [clicked, setClicked] = useState(false);
  const dialog = useRef();
  const fullNameRef = useRef();
  const phoneRef = useRef();
  const [phoneNotValid, setPhoneNotValid] = useState("");

  //Tính tổng tiền các khóa học được chọn mua
  const getCartItemSelectedTotal = () => {
    let sum = 0;
    myCart?.items?.forEach((value) => {
      if (cartItemIdSelected.includes(value._id))
        sum += parseFloat(value.courseId.price);
    });
    return sum;
  };
  //Tính số tiền phải trả cho từng khóa học
  const getAppliedPrice = (cartItemSelected) => {
    const price = parseFloat(cartItemSelected.courseId.price) || 0;
    return partialIds.includes(cartItemSelected._id) ? price * 0.5 : price;
  };
  //Tính tổng tiền cần phải thanh toán
  const getTotalAmount = (cartItemIdSelected) => {
    let totalAmount = 0;
    myCart?.items?.forEach((value) => {
      if (cartItemIdSelected.includes(value._id))
        totalAmount += getAppliedPrice(value);
    });
    return totalAmount;
  };
  useEffect(() => {
    if (user) {
      fetchAPI({ url: `${url}/cart?user_id=${user._id}`, setData: setMyCart });
    }
  }, [user, refresh]);
  //Hàm xử lý chọn nhiều item trong giỏ hàng
  const handleItemSelected = (id) => {
    // Nếu id khóa học chưa tồn tại trong mảng cartItemSelected => khóa học chưa được chọn
    //Thì thêm id khóa học vào mảng cartItemSelected
    if (!cartItemIdSelected.includes(id)) {
      setCartItemIdSelected([...cartItemIdSelected, id]);
    }
    //Nếu id khóa học đã tồn tại trong mảng cartItemSelected => bỏ chọn khóa học
    //Thì xóa id khóa học đó ra khỏi mảng cartItemSelected bằng phương thức filter trả về mảng mới không
    //lấy id khóa học đó
    else {
      const newArr = cartItemIdSelected.filter((value) => value != id);
      setCartItemIdSelected(newArr);
    }
  };
  //Hàm xử lý chọn tất cả item trong giỏ hàng
  const handleClickAll = () => {
    setClicked((prev) => !prev);
    if (!clicked) {
      setCartItemIdSelected(
        myCart?.items?.map((value) => {
          return value._id;
        })
      );
    } else setCartItemIdSelected([]);
  };
  //Hàm xử lý xóa 1 item ra khỏi giỏ hàng
  const handleDelete = (id) => {
    fetch(`${url}/cart?user_id=${user._id}&cart_item_id=${id}`, {
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
        console.log(message);
      });
  };
  //Hàm xử lý xóa nhiều item được chọn ra khỏi giỏ hàng
  const handleDeleteItemSelected = () => {
    fetch(`http://localhost:3000/cart?user_id=${user._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItemSelected: cartItemIdSelected }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ message }) => {
        setCartItemIdSelected([]);
        toast.success(message);
        setClicked(false);
        setRefresh((prev) => prev + 1);
      })
      .catch();
  };
  //Hàm xử lý mở Popup thanh toán
  const handleOpenPurchaseDialog = () => {
    if (cartItemIdSelected.length == 0) {
      toast.warning("Bạn chưa chọn khóa học cần mua");
      return;
    }
    dialog.current.showModal();
  };
  const handlePaymentChange = (id, type) => {
    if (type === "PARTIAL")
      setPartialIds([...partialIds, id]); //Thêm ID vào danh sách trả 50%
    else setPartialIds(partialIds.filter((itemId) => itemId !== id)); //Xóa khỏi danh sách
  };
  //Hàm xử lý mua khóa học
  const handleSubmit = (e) => {
    e.preventDefault();
    const orderItemSelected = myCart?.items
      ?.filter((value) => cartItemIdSelected.includes(value._id))
      ?.map((value) => {
        return {
          orderItemId: value._id,
          courseId: value.courseId._id,
          courseName: value.courseId.title,
          coursePrice: value.courseId.price,
          paymentType: partialIds.includes(value._id) ? "PARTIAL" : "FULL",
          appliedAmount: getAppliedPrice(value),
        };
      });
    // Chỉ cần 1 món là PARTIAL thì cả đơn hàng là chưa hoàn thành
    const orderStatus = orderItemSelected.some(
      (item) => item.paymentType === "PARTIAL"
    )
      ? "Chưa hoàn thành"
      : "Đã hoàn thành";
    if (phoneRef.current.value.length !== 10) {
      setPhoneNotValid("Số điện thoại hợp lệ phải có 10 ký tự");
      return;
    } else {
      fetch("http://localhost:3000/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          fullName: fullNameRef.current.value,
          phone: phoneRef.current.value,
          orderItemSelected: orderItemSelected,
          totalAmount: getTotalAmount(cartItemIdSelected),
          remainingAmount:
            getCartItemSelectedTotal() - getTotalAmount(cartItemIdSelected),
          status: orderStatus,
        }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw res;
        })
        .then(({ message }) => {
          toast.success(message);
          setRefresh((prev) => prev + 1);
          dialog.current.close();
        })
        .catch(async (err) => {
          const { message } = await err.json();
          console.log(message);
        });
    }
  };
  return (
    <div className="page-layout">
      <UserNavBar />
      <div className="main-content">
        <div className="cart" style={{ margin: "50px" }}>
          <table className="cart-table">
            <thead>
              <tr>
                <th className="col-product">Khóa học</th>
                <th className="col-price">Đơn Giá</th>
                <th className="col-action">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {myCart?.items?.map((value) => {
                const image = value.courseId.image.includes("https")
                  ? value.courseId.image
                  : `http://localhost:3000/images/course/${value.courseId.image}`;
                return (
                  <tr key={value._id}>
                    <td className="col-product">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {/* khi thiết lập sự kiện onChange cho checkbox cần phải có thuộc tính checked để kiểm tra true/false */}
                        {/* Checked chỉ đúng khi checkbox đc chọn */}
                        <input
                          type="checkbox"
                          // checkbox được chọn là khi trong mảng cartItemSelected có chứa id của khóa học đó
                          checked={cartItemIdSelected.includes(value._id)}
                          onChange={() => handleItemSelected(value._id)}
                        />
                        <div className="product-cell">
                          <div className="product-thumb">
                            <img src={image} alt="" width={64} height={64} />
                          </div>
                          <div className="product-info">
                            <div className="product-name">
                              {value.courseId.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="col-price">
                      <p style={{ color: "red" }}>{value.courseId.price} VNĐ</p>
                    </td>
                    <td className="col-action">
                      <p
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => handleDelete(value._id)}
                      >
                        Xóa
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5">
                  <div className="footer-row">
                    <div className="left-actions">
                      <label>
                        <input
                          type="checkbox"
                          checked={clicked}
                          onChange={handleClickAll}
                        />
                        Chọn tất cả
                      </label>
                      <button
                        onClick={handleDeleteItemSelected}
                        className="btn-plain"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="right-summary">
                      <div className="total">
                        <span className="label">Tổng tiền:</span>
                        <p style={{ color: "red" }}>
                          {getCartItemSelectedTotal() + " " + "VNĐ"}
                        </p>
                      </div>
                      <button
                        onClick={handleOpenPurchaseDialog}
                        className="btn-buy"
                      >
                        Mua hàng
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <dialog ref={dialog} className="cart-dialog">
          <div className="dialog-container">
            <h2 className="dialog-title">Xác nhận đơn hàng</h2>
            <form method="dialog" onSubmit={handleSubmit} className="cart-form">
              <div className="input-group">
                <input
                  type="text"
                  ref={fullNameRef}
                  placeholder="Họ và tên"
                  required
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <input
                    type="text"
                    ref={phoneRef}
                    placeholder="Số điện thoại"
                    required
                  />
                  {phoneNotValid && (
                    <span style={{ color: "red" }}>{phoneNotValid}</span>
                  )}
                </div>
              </div>
              <div className="table-container">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Khóa học</th>
                      <th>Giá</th>
                      <th>Hình thức thanh toán</th>
                      <th>Số tiền phải trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCart?.items?.map((value) => {
                      if (cartItemIdSelected.includes(value._id)) {
                        const image = value.courseId.image.includes("https")
                          ? value.courseId.image
                          : `http://localhost:3000/images/course/${value.courseId.image}`;
                        return (
                          <tr key={value._id}>
                            <td className="course-info">
                              <img src={image} alt="" />
                              <span>{value.courseId.title}</span>
                            </td>
                            <td className="price-cell">
                              {value.courseId.price} VNĐ
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "10px",
                                }}
                              >
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <input
                                    type="radio"
                                    name={`radio-${value._id}`}
                                    checked={partialIds?.includes(value._id)}
                                    onChange={() =>
                                      handlePaymentChange(value._id, "PARTIAL")
                                    }
                                    value="partial"
                                  />
                                  Thanh toán 50%
                                </div>
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <input
                                    type="radio"
                                    name={`radio-${value._id}`}
                                    checked={!partialIds?.includes(value._id)}
                                    onChange={() =>
                                      handlePaymentChange(value._id, "FULL")
                                    }
                                    value="full"
                                  />
                                  Thanh toán 100%
                                </div>
                              </div>
                            </td>
                            <td>{getAppliedPrice(value)} VNĐ</td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="total-box">
                <span>Tổng cộng:</span>
                <strong>{getTotalAmount(cartItemIdSelected)} VND</strong>
              </div>
              <div className="btn-group">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => dialog.current.close()}
                >
                  Hủy
                </button>
                <button className="btn-submit">Thanh toán ngay</button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
      <Footer />
    </div>
  );
}
