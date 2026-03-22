import React from "react";
import {Link, useLocation} from "react-router";
import LanguageSelector from "./LanguageSelector.jsx";
import {useTranslation} from "react-i18next";

const HeaderTabs = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="nav-tabs">
      <div className={"nav-tab" + (location.pathname === "/" ? " active" : "")}><Link to={"/"}>{t("tabs.chatbot.label")}</Link></div>
      <div className={"nav-tab" + (location.pathname === "/cv" ? " active" : "")}><Link to={"/cv"}>{t("tabs.cv.label")}</Link></div>
      <div className={"nav-tab" + (location.pathname === "/career" ? " active" : "")}><Link to={"/career"}>{t("tabs.career.label")}</Link></div>
      <LanguageSelector />
    </nav>
  );
}

export default HeaderTabs;