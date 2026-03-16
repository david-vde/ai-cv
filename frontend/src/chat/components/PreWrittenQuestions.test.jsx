import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PreWrittenQuestions from "./PreWrittenQuestions";

describe("PreWrittenQuestions - Rendering", () => {
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

  it.each(questions)("affiche la question '%s'", (question) => {
    const { asFragment } = render(<PreWrittenQuestions onClickPresetQuestion={() => {}} />);
    expect(screen.getByText(question.cta)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it.each(questions)("déclenche onClickPresetQuestion pour '%s'", (question) => {
    const mockClick = vi.fn();
    const { asFragment } = render(<PreWrittenQuestions onClickPresetQuestion={mockClick} />);
    fireEvent.click(screen.getByText(question.cta));
    expect(mockClick).toHaveBeenCalledWith(question.q);
    expect(asFragment()).toMatchSnapshot();
  });
});

