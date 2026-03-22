import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PreWrittenQuestions from "./PreWrittenQuestions";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key + " - translated"
  })
}));

const questions = [
  {cta: "🧑 question.preWritten.short.introduce - translated", q: "question.preWritten.full.introduce - translated"},
  {cta: "💼 question.preWritten.short.jobSearchReason - translated", q: "question.preWritten.full.jobSearchReason - translated"},
  {cta: "⭐ question.preWritten.short.quality - translated", q: "question.preWritten.full.quality - translated"},
  {cta: "⚠️ question.preWritten.short.weakness - translated", q: "question.preWritten.full.weakness - translated"},
  {cta: "👯‍♀️ question.preWritten.short.teamwork - translated", q: "question.preWritten.full.teamwork - translated"},
  {cta: "🔮 question.preWritten.short.futureVision - translated", q: "question.preWritten.full.futureVision - translated"},
  {cta: "🧠 question.preWritten.short.experience - translated", q: "question.preWritten.full.experience - translated"},
  {cta: "💰 question.preWritten.short.salary - translated", q: "question.preWritten.full.salary - translated"},
  {cta: "🎯 question.preWritten.short.hobbies - translated", q: "question.preWritten.full.hobbies - translated"},
  {cta: "👨‍👩‍👧 question.preWritten.short.familySituation - translated", q: "question.preWritten.full.familySituation - translated"}
];

describe("PreWrittenQuestions - Rendering", () => {
  it.each(questions)("display question '%s'", (question) => {
    const { asFragment } = render(<PreWrittenQuestions onClickPresetQuestion={() => {}} />);
    expect(screen.getByText(question.cta)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("PreWrittenQuestions - onClick", () => {
  it.each(questions)("trigger onClickPresetQuestion for '%s'", (question) => {
    const onClickPresetQuestion = vi.fn();
    render(<PreWrittenQuestions onClickPresetQuestion={onClickPresetQuestion} />);
    const btn = screen.getByText(question.cta);
    fireEvent.click(btn);
    expect(onClickPresetQuestion).toHaveBeenCalledWith(question.q);
  });
});
