import UserNavBar from "./UserNavBar";
import Carousel from "./Carousel";
import Footer from "./Footer";
import CoursesFree from "./CoursesFree";
import CoursesPre from "./CoursesPre";

export default function HomeUser() {
  return (
    <>
      <UserNavBar />
      <Carousel />
      <CoursesFree />
      <CoursesPre />
      <Footer />
    </>
  );
}
