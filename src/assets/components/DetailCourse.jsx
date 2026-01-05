import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import AppContext from "./AppContext";
import { toast } from "react-toastify";
import { fetchAPI } from "../service/api";
import { url } from "../../App";
import UserNavBar from "./UserNavBar";
import ReactPlayer from "react-player";
import Footer from "./Footer";
import "./components-css/Detail.css";

export default function DetailCourse() {
  const navigate = useNavigate();
  const { user, isLogin, refresh, setRefresh } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id"); //
  const lesson_order = searchParams.get("lesson_order");
  const [course, setCourse] = useState("");
  const dialog = useRef();
  const comment = useRef();
  const [courseIdInCart, setCourseIdInCart] = useState([]);
  const [courseInEnrollment, setCourseInEnrollment] = useState([]);
  const [commentsInCourse, setCommentsInCourse] = useState([]);
  let thumbnail = null;
  thumbnail = course?.thumbnail?.includes("https")
    ? course.thumbnail
    : `${url}/images/course/${course.thumbnail}`;
  //Tìm kiếm bài học ứng với thứ tự được chọn
  const lesson = course.lessons
    ? course.lessons.find((value) => value.order == lesson_order)
    : null;
  //Tìm kiếm khóa học người dùng đã sở hữu
  const enrollmentDetail = courseInEnrollment?.find(
    (value) => value.courseId._id === course._id
  );
  const isOwned = !!enrollmentDetail;
  //Hàm tính thời gian bình luận
  const getTimeComment = (value) => {
    const now = new Date();
    const createdAt = new Date(value.createdAt);
    // Tính khoảng cách thời gian theo giây
    const diffInSeconds = Math.floor((now - createdAt) / 1000); //Chia 1000 để đổi mili giây sang giây
    if (diffInSeconds < 0) return "Vừa xong";
    if (diffInSeconds < 60) return `${diffInSeconds} giây`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} tháng`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm`;
  };
  useEffect(() => {
    if (id) {
      fetchAPI({ url: `${url}/course?id=${id}`, setData: setCourse });
      fetchAPI({
        url: `${url}/review?course_id=${id}`,
        setData: setCommentsInCourse,
      });
    }
    if (user) {
      fetch(`${url}/cart?user_id=${user._id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw res;
        })
        .then(({ data }) => {
          console.log(data);
          setCourseIdInCart(
            data?.items?.map((value) => {
              return value.courseId._id;
            })
          );
        });
      fetch(`${url}/enrollment?user_id=${user._id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw res;
        })
        .then(({ data }) => {
          console.log(data);
          setCourseInEnrollment(data);
        });
    } else {
      // KHI LOGOUT: Reset toàn bộ state liên quan đến user về mặc định
      setCourseIdInCart([]);
      setCourseInEnrollment([]);
    }
  }, [id, user, refresh, isLogin]);
  //Hàm xử lý thêm vào giỏ hàng
  const handleAddCart = () => {
    if (!isLogin) {
      toast.warning("Bạn chưa đăng nhập");
      return;
    }
    fetch("${url}/cart", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        userId: user._id,
        courseId: course._id,
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
  };
  //Hàm xử lý đăng ký học khóa học miễn phí
  const handleEnrollFree = () => {
    if (!isLogin) {
      toast.warning("Bạn chưa đăng nhập");
    } else {
      fetch(`${url}/enrollment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          courseId: course._id,
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
  //Hàm xử lý mở dialog xem video bài học
  const handleOpenDialog = (value, index) => {
    if (!isLogin) {
      toast.warning("Bạn chưa đăng nhập");
      return;
    } else if (!isOwned) {
      toast.warning("Bạn chưa sở hữu khóa học");
      return;
    } else if (
      enrollmentDetail?.accessLevel === "LIMITED" &&
      value.isPreview == false
    ) {
      toast.warning(
        "Vui lòng thanh toán nốt 50% còn lại để xem toàn bộ bài học trong khóa học"
      );
      return;
    } else {
      navigate(`/course?id=${id}&lesson_order=${index + 1}`);
      dialog.current.showModal();
    }
  };
  //Hàm xử lý đăng bình luận
  const handlePostComment = () => {
    if (!isLogin) {
      toast.warning("Bạn chưa đăng nhập, không thể bình luận");
      return;
    } else if (!isOwned) {
      toast.warning("Bạn chưa sở hữu khóa học này, không thể bình luận");
      return;
    } else {
      if (comment.current.value !== "") {
        fetch(`${url}/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            courseId: course._id,
            comment: comment.current.value,
          }),
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw res;
          })
          .then(({ message }) => {
            console.log(message);
            comment.current.value = "";
            setRefresh((prev) => prev + 1);
          })
          .catch(async (err) => {
            const { message } = await err.json();
            console.log(message);
          });
      }
    }
  };
  return (
    <>
      <UserNavBar></UserNavBar>
      <div className="course-card">
        <div className="course-hero">
          <img className="course-thumb" src={thumbnail} alt={course.title} />
          <div className="course-side">
            <div className="level">{course.title}</div>
            <div className="price">
              {course.price > 0 ? (
                <p>Giá: {course.price} VNĐ</p>
              ) : (
                <p style={{ color: "#16a34a" }}>Miễn phí</p>
              )}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#334a5e" }}>
              {course.totalLessons} bài học
            </div>
            {isLogin && isOwned ? (
              enrollmentDetail.accessLevel === "LIMITED" ? (
                <button className="btn-course btn-warning">
                  <i className="fas fa-unlock-alt"></i> Thanh toán nốt 50% còn
                  lại
                </button>
              ) : (
                <button className="btn-course btn-activated" disabled>
                  <i className="fas fa-check-circle"></i> Đã kích hoạt
                </button>
              )
            ) : (
              <>
                {course.isFree ? (
                  <button
                    className="btn-course btn-primary"
                    onClick={handleEnrollFree}
                  >
                    Đăng ký học ngay
                  </button>
                ) : (
                  <>
                    {isLogin && courseIdInCart?.includes(course._id) ? (
                      <button className="btn-course btn-in-cart" disabled>
                        <i className="fas fa-shopping-cart"></i> Đã trong giỏ
                      </button>
                    ) : (
                      <button
                        className="btn-course btn-primary"
                        onClick={handleAddCart}
                      >
                        Thêm vào giỏ
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <h2 className="course-title">{course.title}</h2>
        <div className="course-meta">{course.shortDescription || ""}</div>
        <div className="info-grid">
          <div className="info-card">
            <h3>Mô tả</h3>
            <p style={{ margin: 0 }}>{course.description}</p>
          </div>
          <div className="info-card">
            <div className="info-split">
              <div>
                <h3>Yêu cầu</h3>
                {course?.requirements?.length > 0 ? (
                  <ul>
                    {course.requirements.map((value, index) => (
                      <li key={index}>{value}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Không có yêu cầu bắt buộc</p>
                )}
              </div>
              <div>
                <h3>Bạn sẽ học được</h3>
                {course?.objectives?.length > 0 ? (
                  <ul>
                    {course.objectives.map((value, index) => (
                      <li key={index}>{value}</li>
                    ))}
                  </ul>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="lessons">
          <div className="lessons-title">Nội dung khóa học</div>
          {course?.lessons?.map((value, index) => (
            <div
              key={index}
              style={{
                display: "block",
                marginBottom: "8px",
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => handleOpenDialog(value, index)}
                className={`lesson-item ${!value.isPreview ? "is-locked" : ""}`}
              >
                <div className="lesson-left">
                  <div className="play">
                    {!isLogin ||
                    !isOwned ||
                    (enrollmentDetail?.accessLevel === "LIMITED" &&
                      !value.isPreview)
                      ? "🔒"
                      : "▶"}
                  </div>
                  <div className="lesson-title">
                    <p>
                      {index + 1}. {value.title}
                    </p>
                  </div>
                </div>
                <div className="lesson-time">{value.duration || "00:00"}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="detail-comment-section">
          <h3 className="detail-comments-title">Các bình luận</h3>
          <div className="detail-comment-input-container">
            <input
              type="text"
              ref={comment}
              className="detail-comment-input"
              placeholder="Viết bình luận của bạn..."
              required
            />
            <button
              onClick={handlePostComment}
              className="detail-comment-button"
            >
              Gửi
            </button>
          </div>
          <div className="detail-comment-list">
            {commentsInCourse?.map((value) => {
              const image = value.userId.avatar.includes("https")
                ? value.userId.avatar
                : `${url}/images/user/${value.userId.avatar}`;
              return (
                <div key={value._id} className="detail-comment-item">
                  <img
                    src={image}
                    alt={value.userId.username}
                    className="detail-comment-avatar"
                  />
                  <div className="detail-comment-body">
                    <p className="detail-comment-username">
                      {value.userId.username}
                    </p>
                    <p className="detail-comment-text">{value.comment}</p>
                    <p>{getTimeComment(value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <dialog ref={dialog} className="video-dialog">
        <button className="close-btn" onClick={() => dialog.current.close()}>
          ×
        </button>
        <div
          style={{
            width: "700px",
            height: "350px",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          <ReactPlayer
            width="100%"
            height="100%"
            src={lesson?.videoUrl}
            controls={true}
          />
        </div>
        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Đang học: {lesson?.title}
        </div>
      </dialog>
      <Footer></Footer>
    </>
  );
}
