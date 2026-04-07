import React from "react";
import {useConfig} from "../../configs/context/ConfigContext.tsx";
import {FaGithub, FaLinkedin} from "react-icons/fa";
import _ from "lodash";

const LinksPanel: React.FC = () => {
  const { configs } = useConfig();

  return (
    <div className="links-panel">
      <a href={_.get(configs, ['contact.github'])} className="link-btn link-github" target="_blank">
        <FaGithub size={14} /> GitHub
      </a>
      <a href={_.get(configs, ['contact.linkedin'])} className="link-btn link-linkedin" target="_blank">
        <FaLinkedin size={14} /> LinkedIn
      </a>
      <a href={_.get(configs, ['contact.chatbot_github_repository'])} className="link-btn link-repo" target="_blank">
        <FaGithub size={14} /> Chatbot repository
      </a>
    </div>
  );
}

export default LinksPanel;