import { Link } from "react-router-dom";
import { useContext } from "react";
import AppContext from "./AppContext";
import "./components-css/CoursesFree.css";

export default function CoursesFree() {
  const { courses } = useContext(AppContext);
  return (
    <>
      <section className="course-free-component">
        <h2>Khóa học miễn phí</h2>
        <div className="course-free-track">
          {courses.length > 0 ? (
            courses.map((value) => {
              if (value.isFree) {
                const image = value.image.includes("https")
                  ? value.image
                  : `http://localhost:3000/images/course/${value.image}`;
                return (
                  <div key={value._id} className="course-free-item">
                    <Link to={`/course?id=${value._id}`}>
                      <img src={image} alt="" width={150} height={200} />
                    </Link>
                    <p>{value.title}</p>
                  </div>
                );
              }
            })
          ) : (
            <p>Không có khóa học nào để hiển thị</p>
          )}
        </div>
      </section>
    </>
  );
}
