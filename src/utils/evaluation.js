// src/utils/evaluation.js

/**
 * Re‐normalizes to a 0–10 scale only the sections that have at least one answer.
 *
 * @param {object} answers  – an object matching EVAL_CONFIG, values null or number
 * @param {object} config   – your EVAL_CONFIG object
 * @returns {number}        – a rating from 0 to 10 (one decimal place)
 */
export function computeDynamicRatingOutOf10(answers, config) {
    let weightedSum = 0;
    let totalWeight = 0;
  
    for (const [cat, { weight, items }] of Object.entries(config)) {
      // skip any category with no answered items
      const hasAnswer = items.some((it) => answers[cat][it.key] != null);
      if (!hasAnswer) continue;
  
      // sum the participant's scores in this category
      const raw    = items.reduce((sum, { key }) => sum + (answers[cat][key] || 0), 0);
      // sum the max possible for this category
      const maxSum = items.reduce((sum, { max }) => sum + max, 0);
      // normalized fraction 0–1 for this category
      const norm   = maxSum ? raw / maxSum : 0;
  
      weightedSum += norm * weight;
      totalWeight += weight;
    }
  
    // if nothing was answered, return 0
    if (totalWeight === 0) return 0;
  
    // compute the weighted average fraction, scale to 0–10, round to 1 decimal
    return Number(((weightedSum / totalWeight) * 10).toFixed(1));
  }
  