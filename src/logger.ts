import { styleText } from "node:util";

type LogMethod = (...messages: unknown[]) => void;
type LogColor = Parameters<typeof styleText>[0];

function formatMessage(label: string, color: LogColor, messages: unknown[]): string {
  const message = messages
    .map((item) =>
      item instanceof Error ? item.message : typeof item === "string" ? item : String(item),
    )
    .join(" ");

  return `${styleText(color, label)} ${message}`;
}

function write(label: string, color: LogColor): LogMethod {
  return (...messages) => {
    console.log(formatMessage(label, color, messages));
  };
}

export const logger = {
  log: (...messages: unknown[]) => console.log(...messages),
  info: write("ℹ", "cyan"),
  success: write("✔", "green"),
  warn: write("⚠", "yellow"),
  error: (...messages: unknown[]) => {
    console.error(formatMessage("✖", "red", messages));
  },
  start: write("◐", "cyan"),
};
