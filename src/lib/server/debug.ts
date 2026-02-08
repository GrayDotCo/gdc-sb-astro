if (typeof window !== "undefined") {
  throw new Error("serverLog imported in client bundle");
}

function getTimeStamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-CA", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


export function serverLog(...args: any[]) {
  // Hard stop: never allow client execution
  if (!import.meta.env.SSR) return;

  const label = 'SERVER LOG';
  const timestamp = getTimeStamp();
  const prefix = `\n${timestamp} [${label}]`;

  console.log(prefix, ...args);
}
