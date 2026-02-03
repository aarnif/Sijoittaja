import Exactum2 from "../assets/exactum-2.svg?react";
import "./MainView.css";
import { useAuth } from "../contexts/AuthContext";

function MainView() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="main-header">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <button className="logout-button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="wrapper">
        <Exactum2 className="floor-image" />
      </div>
    </>
  );
}

export default MainView;
