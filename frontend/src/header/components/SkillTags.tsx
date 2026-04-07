import React from "react";
import {useConfig} from "../../configs/context/ConfigContext.tsx";
import _ from "lodash";

interface Skill {
  name: string,
  bgColor: string,
  textColor: string,
  borderColor: string
}

const SkillTags: React.FC = () => {
  const { configs } = useConfig();
  const skills: Skill[] = JSON.parse(_.get(configs, ['contact.skill_tags'], '[]'));

  if (skills.length < 1) {
    return null;
  }

  return (
    <div className="tags">
      {
        skills.map((skill: Skill, index: number) => (
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