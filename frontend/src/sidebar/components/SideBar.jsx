import React from "react";
import PreWrittenQuestions from "./PreWrittenQuestions.jsx";
import InBriefBox from "./InBriefBox.jsx";

const SideBar = (props) => {
  const {onClickPresetQuestion} = props;

  return (
    <div className="sidebar">

      <div className="side-card">
        <PreWrittenQuestions onClickPresetQuestion={onClickPresetQuestion} />
      </div>

      <div className="side-card">
        <InBriefBox />
      </div>

    </div>
  );
}

export default SideBar;

