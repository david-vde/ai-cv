import React from "react";
import SkillTags from "./SkillTags.jsx";
import ContactLinks from "./ContactLinks.jsx";
import LinksPanel from "./LinksPanel.jsx";
import davidPicture from "../../assets/pictures/david-avatar.jpg";
import {useConfig} from "../../configs/context/ConfigContext.jsx";
import HeaderTabs from "./HeaderTabs.jsx";
import _ from "lodash";
import {useTranslation} from "react-i18next";

const Header = () => {
  const { configs } = useConfig();
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="avatar-wrap">
          <img className="avatar" src={davidPicture} alt={_.get(configs, ['contact.firstname'])}/>
        </div>
        <div className="bio">
          <div className="bio-name">{_.get(configs, ['contact.firstname'])} {_.get(configs, ['contact.lastname'])}</div>
          <div className="bio-title">
            {configs['contact.profession']}&nbsp;&nbsp;·&nbsp;&nbsp;
            <span>{t("profile.yearsOfExperience", {years: configs['contact.experience_years']})}</span>
          </div>
          <SkillTags/>
          <ContactLinks/>
        </div>
        <LinksPanel/>
      </div>
      <HeaderTabs/>
    </header>
  );
}

export default Header;