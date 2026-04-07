import React from "react";
import {useTranslation} from "react-i18next";

interface PreWrittenQuestionsProps {
  onClickPresetQuestion: (question: string) => void;
}

const PreWrittenQuestions: React.FC = ({onClickPresetQuestion}: PreWrittenQuestionsProps) => {
  const { t } = useTranslation();

  const questions: Array<{ cta: string; q: string }> = [
    {cta: "🧑 " + t("question.preWritten.short.introduce"), q: t("question.preWritten.full.introduce")},
    {cta: "💼 " + t("question.preWritten.short.jobSearchReason"), q: t("question.preWritten.full.jobSearchReason")},
    {cta: "⭐ " + t("question.preWritten.short.quality"), q: t("question.preWritten.full.quality")},
    {cta: "⚠️ " + t("question.preWritten.short.weakness"), q: t("question.preWritten.full.weakness")},
    {cta: "👯‍♀️ " + t("question.preWritten.short.teamwork"), q: t("question.preWritten.full.teamwork")},
    {cta: "🔮 " + t("question.preWritten.short.futureVision"), q: t("question.preWritten.full.futureVision")},
    {cta: "🧠 " + t("question.preWritten.short.experience"), q: t("question.preWritten.full.experience")},
    {cta: "💰 " + t("question.preWritten.short.salary"), q: t("question.preWritten.full.salary")},
    {cta: "🎯 " + t("question.preWritten.short.hobbies"), q: t("question.preWritten.full.hobbies")},
    {cta: "👨‍👩‍👧 " + t("question.preWritten.short.familySituation"), q: t("question.preWritten.full.familySituation")}
  ];

  return (
    <div className="cta-row">
      {
        questions.map((q, index) => {
          return (
            <span key={"question-" + index} className="cta-chip" onClick={() => onClickPresetQuestion(q.q)}>{q.cta}</span>
          );
        })
      }
    </div>
  );
}

export default PreWrittenQuestions;