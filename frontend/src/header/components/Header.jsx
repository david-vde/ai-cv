import React from "react";
import SkillTags from "./SkillTags.jsx";
import ContactLinks from "./ContactLinks.jsx";
import LinksPanel from "./LinksPanel.jsx";
import davidPicture from "../../assets/pictures/david-avatar.png";
import {useConfig} from "../../configs/context/ConfigContext.jsx";
import HeaderTabs from "./HeaderTabs.jsx";

const Header = () => {
  const { configs } = useConfig();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="avatar-wrap">
          <img className="avatar" src={davidPicture} alt={"David"} />
        </div>
        <div className="bio">
          <div className="bio-name">{configs['contact.firstname']} {configs['contact.lastname']}</div>
          <div className="bio-title">
            {configs['contact.profession']}&nbsp;&nbsp;·&nbsp;&nbsp;
            <span>{configs['contact.experience_years']} ans d'expérience</span>
          </div>
          <SkillTags />
          <ContactLinks />
        </div>
        <LinksPanel />
      </div>
      <HeaderTabs />
    </header>
  );
}

export default Header;