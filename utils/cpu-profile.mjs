/**
 * @typedef {import('node:inspector').Profiler.Profile} Profile
 * @typedef {import('node:inspector').Profiler.ProfileNode} ProfileNode
 */

/** @param profile { Profile } */
export function convert(profile) {
  const totalTime = formatTime(profile.endTime - profile.startTime);

  const nodes = new Map();

  for (const node of profile.nodes) {
    let time = 0;

    for (const [index, sample] of profile.samples.entries()) {
      if (sample === node.id) {
        time += profile.timeDeltas[index];
      }
    }

    const name = formatName(node);
    const entry = nodes.get(name);
    nodes.set(name, time + (entry || 0));
  }

  const functionExecutionTimes = Array.from(nodes.entries())
    // Sort by slowest
    .sort((a, b) => b[1] - a[1])
    .map((node) => ({
      name: node[0],
      time: formatTime(node[1]),
    }));

  return {
    functionExecutionTimes,
    totalTime,
  };
}

/** @param node { ProfileNode } */
function formatName({ callFrame }) {
  if (callFrame.functionName && callFrame.url) {
    return `${callFrame.functionName} at ${callFrame.url}`;
  }

  if (callFrame.url) {
    return `(anonymous) at ${callFrame.url}`;
  }

  return callFrame.functionName || "(anonymous)";
}

// Micro seconds to seconds
function formatTime(microSeconds) {
  return microSeconds / 1_000_000;
}
