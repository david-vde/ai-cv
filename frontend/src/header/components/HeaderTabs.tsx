import React from "react";
import {Link, useLocation} from "react-router";
import LanguageSelector from "./LanguageSelector.tsx";
import {useTranslation} from "react-i18next";
import {Location} from "react-router-dom";

const HeaderTabs = () => {
  const location: Location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="nav-tabs">
      <div className={"nav-tab" + (location.pathname === "/" ? " active" : "")}><Link to={"/"}>{t("tabs.chatbot.label")}</Link></div>
      <div className={"nav-tab" + (location.pathname === "/cv" ? " active" : "")}><Link to={"/cv"}>{t("tabs.cv.label")}</Link></div>
      <LanguageSelector />
    </nav>
  );
}

export default HeaderTabs;