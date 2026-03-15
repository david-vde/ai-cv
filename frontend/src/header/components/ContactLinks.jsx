import React from "react";

const ContactLinks = () => {

  function reveal(encoded) {
    return atob(encoded);
  }

  const email = reveal("ZGF2aWQudmFuZGVyZWxzdEBnbWFpbC5jb20=");
  const phone = reveal("KzMyIDQ4NSA1OSAyNyA5OQ==");

  return (
    <div className="contacts">
      <a className="contact-item" href={"tel:" + phone}>📱 {phone}</a>
      <a className="contact-item" href={"mailto:" + email}>✉️ {email}</a>
    </div>
  );
}

export default ContactLinks;