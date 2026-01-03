import { url } from "../../App";
import "./components-css/LoginGoogle.css";
export default function LoginGoogle() {
  return (
    <div
      onClick={() => (window.location.href = `${url}/auth/google`)}
      className="login-google-button"
    >
      <div className="google-icon-container">
        <img
          className="google-icon"
          src="./src/assets/logo-google.png"
          alt="Google logo"
        />
      </div>
      <p className="button-text">Đăng nhập với google</p>
    </div>
  );
}
