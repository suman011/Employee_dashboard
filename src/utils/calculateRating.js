import { EVAL_CONFIG } from "../config/evalConfig.js";

export function calculateWeightedRating(answers) {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(EVAL_CONFIG).forEach(([sectionKey, { weight, items }]) => {
    const subScores = items.map((item) => {
      const val = parseFloat(answers?.[sectionKey]?.[item.key]);
      if (isNaN(val)) return null;
      return (val / item.max) * 10;
    }).filter((v) => v !== null);

    const sectionScore = subScores.length > 0
      ? subScores.reduce((sum, v) => sum + v, 0) / subScores.length
      : 0;

    if (subScores.length > 0) {
      weightedSum += sectionScore * weight;
      totalWeight += weight;
    }
  });

  const overallRating = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return parseFloat(overallRating.toFixed(1));
}
