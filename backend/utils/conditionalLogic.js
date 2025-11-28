export function shouldShowQuestion(rules, answersSoFar) {
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
