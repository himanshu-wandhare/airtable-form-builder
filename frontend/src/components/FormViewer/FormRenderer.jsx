import { useState } from "react";
import QuestionField from "./QuestionField";

function shouldShowQuestion(rules, answersSoFar) {
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    const results = rules.conditions.map((condition) => {
        const answer = answersSoFar[condition.questionKey];

        if (answer === undefined || answer === null) {
            return false;
        }

        switch (condition.operator) {
            case "equals":
                return answer === condition.value;
            case "notEquals":
                return answer !== condition.value;
            case "contains":
                if (typeof answer === "string") {
                    return answer.includes(condition.value);
                }
                if (Array.isArray(answer)) {
                    return answer.includes(condition.value);
                }
                return false;
            default:
                return false;
        }
    });

    if (rules.logic === "AND") {
        return results.every((r) => r === true);
    } else {
        return results.some((r) => r === true);
    }
}

export default function FormRenderer({ form, onSubmit, submitting }) {
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (questionKey, value) => {
        setAnswers((prev) => ({ ...prev, [questionKey]: value }));
        if (errors[questionKey]) {
            setErrors((prev) => ({ ...prev, [questionKey]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        form.questions.forEach((question) => {
            const shouldShow = shouldShowQuestion(
                question.conditionalRules,
                answers
            );

            if (
                shouldShow &&
                question.required &&
                !answers[question.questionKey]
            ) {
                newErrors[
                    question.questionKey
                ] = `${question.label} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(answers);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {form.questions.map((question) => {
                const shouldShow = shouldShowQuestion(
                    question.conditionalRules,
                    answers
                );

                if (!shouldShow) return null;

                return (
                    <QuestionField
                        key={question.questionKey}
                        question={question}
                        value={answers[question.questionKey]}
                        onChange={(value) =>
                            handleChange(question.questionKey, value)
                        }
                        error={errors[question.questionKey]}
                    />
                );
            })}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit Form"}
                </button>
            </div>
        </form>
    );
}
