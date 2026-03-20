import React from "react";
import {Link, useLocation} from "react-router";

const HeaderTabs = () => {
  const location = useLocation();

  return (
    <nav className="nav-tabs">
      <div className={"nav-tab" + (location.pathname === "/" ? " active" : "")}><Link to={"/"}>Chatbot</Link></div>
      <div className={"nav-tab" + (location.pathname === "/cv" ? " active" : "")}><Link to={"/cv"}>C.V.</Link></div>
      <div className={"nav-tab" + (location.pathname === "/career" ? " active" : "")}><Link to={"/career"}>Carrière</Link></div>
    </nav>
  );
}

export default HeaderTabs;