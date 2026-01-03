import { Link } from "react-router-dom";
import "./components-css/Footer.css";
import { FaFacebookF, FaYoutube, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Lập Trình Online</h3>
          <p>
            Website cung cấp khóa học lập trình chất lượng, giúp bạn phát triển
            kỹ năng và sự nghiệp IT.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Liên kết nhanh</h3>
          <ul>
            <li>
              <Link to="#">Trang chủ</Link>
            </li>
            <li>
              <Link to="#">Khóa học</Link>
            </li>
            <li>
              <Link to="#">Liên hệ</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-title">Liên hệ</h3>
          <p>Email: quoctien15904@gmail.com</p>
          <p>Hotline: 0903 006 340</p>
          <div className="footer-social">
            <Link to="#">
              <FaFacebookF />
            </Link>
            <Link to="#">
              <FaYoutube />
            </Link>
            <Link to="#">
              <FaGithub />
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 Lập Trình Online. All rights reserved.
      </div>
    </footer>
  );
}
