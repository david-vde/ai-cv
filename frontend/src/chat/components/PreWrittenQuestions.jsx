import React from "react";

const PreWrittenQuestions = (props) => {
  const {onClickPresetQuestion} = props;


  const questions = [
    {cta: "🧑 Présentation", q: "Peux-tu te présenter un petit peu ?"},
    {cta: "💼 Raison de recherche d'emploi", q: "Pourquoi tu cherches un nouveau poste ?"},
    {cta: "⭐ Tes qualités", q: "Quelles sont tes qualités / tes points forts ?"},
    {cta: "⚠️ Tes faiblesses", q: "Quelles sont tes faiblesses / tes points faibles ?"},
    {cta: "👯‍♀️ Travail en équipe", q: "Comment travaillez-vous avec les autres ?"},
    {cta: "🔮 Vision du futur", q: "Où te vois-tu dans quelques années ?"},
    {cta: "🧠 Expérience", q: "Parle-nous d'une expérience professionnelle pertinente."},
    {cta: "💰 Salaire", q: "Quelles sont tes prétentions salariales ?"},
    {cta: "🎯Hobbies", q: "Quels sont tes hobbies ?"},
    {cta: "👨‍👩‍👧 Situation familiale", q: "Quelle est ta situation familiale ?"}
  ];

  return (
    <div className="cta-row">
      {
        questions.map((q) => {
          return (
            <span className="cta-chip" onClick={() => onClickPresetQuestion(q.q)}>{q.cta}</span>
          );
        })
      }
    </div>
  );
}

export default PreWrittenQuestions;