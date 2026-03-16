import React from "react";
import SkillTags from "./SkillTags.jsx";
import ContactLinks from "./ContactLinks.jsx";
import LinksPanel from "./LinksPanel.jsx";
import davidPicture from "../../assets/pictures/david-avatar.png";
const Header = () => {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="avatar-wrap">
          <img className="avatar" src={davidPicture} alt={"David"} />
        </div>
        <div className="bio">
          <div className="bio-name">David Vander Elst</div>
          <div className="bio-title">Senior PHP developer&nbsp;&nbsp;·&nbsp; <span>20 ans d'expérience</span></div>
          <SkillTags />
          <ContactLinks />
        </div>
        <LinksPanel />
      </div>
      <nav className="nav-tabs">
        <div className="nav-tab active">Chat</div>
        <div className="nav-tab">Parcours</div>
        <div className="nav-tab">Projets</div>
      </nav>
    </header>
  );
}

export default Header;