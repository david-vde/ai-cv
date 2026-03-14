import React from "react";

const PreWrittenQuestions = (props) => {
  const {onClickPresetQuestion} = props;

  return (
    <>
      <div className="side-card-title">Questions fréquentes</div>
      <div className="qq-list">
        <div className="qq-item" onClick={() => onClickPresetQuestion("Tu maîtrises quels frameworks backend ?")}>Frameworks backend ?<span
          className="qq-arrow">→</span></div>
        <div className="qq-item"
             onClick={() => onClickPresetQuestion("Tu as de l\'expérience en architecture microservices ?")}>Architecture
          microservices ?<span className="qq-arrow">→</span></div>

      </div>
    </>
  );
}

export default PreWrittenQuestions;