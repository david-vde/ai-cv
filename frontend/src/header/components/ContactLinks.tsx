import React from "react";
import { useConfig } from '../../configs/context/ConfigContext';

const ContactLinks: React.FC = () => {
  const { configs } = useConfig();

  return (
    <div className="contacts">
      <a className="contact-item phone" href={"tel:" + configs['contact.phone']}>📱 {configs['contact.phone']}</a>
      <a className="contact-item email" href={"mailto:" + configs['contact.email']}>✉️ {configs['contact.email']}</a>
    </div>
  );
}

export default ContactLinks;