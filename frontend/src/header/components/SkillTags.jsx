import React from "react";
import {useConfig} from "../../configs/context/ConfigContext.jsx";
import _ from "lodash";

const SkillTags = () => {
  const { configs } = useConfig();
  let skills = JSON.parse(_.get(configs, ['contact.skill_tags'], '[]'));

  if (skills.length < 1) {
    return null;
  }

  return (
    <div className="tags">
      {
        skills.map((skill, index) => (
          <span
            key={index}
            className={"tag"}
            style={{
              backgroundColor: "#" + skill[1],
              color: "#" + skill[2],
              borderColor: "#" + skill[3]
            }}
          >
            {skill[0]}
          </span>
        ))
      }
    </div>
  );
}

export default SkillTags;