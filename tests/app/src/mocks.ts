export const canvasWidth = 320;
export const canvasHeight = 180;

export type Quality = "low" | "medium" | "high";
type QualityMultiplier = 1 | 2 | 4;

const QUALITY_MULTIPLIER: Record<Quality, QualityMultiplier> = {
  low: 1,
  medium: 2,
  high: 4,
};

export const createStream: (
  emoji: string,
  backgroundColor: string,
  quality: Quality,
  framerate: number,
) => {
  stop: () => void;
  stream: MediaStream;
} = (emoji: string, backgroundColor: string, quality: Quality, framerate: number) => {
  const multiplier = QUALITY_MULTIPLIER[quality];
  const canvasElement = document.createElement("canvas");
  const currentCanvasWidth = canvasWidth * multiplier;
  const currentCanvasHeight = canvasHeight * multiplier;

  canvasElement.width = currentCanvasWidth;
  canvasElement.height = currentCanvasHeight;
  const ctx = canvasElement.getContext("2d");
  if (!ctx) throw "ctx is null";
  const fontSize = 120 * multiplier;

  let degree = 0;

  const drawEmojii = () => {
    if (degree > 360) {
      degree = 0;
    }
    const radian = (degree * Math.PI) / 180;
    const translateX = currentCanvasWidth / 2;
    const translateY = currentCanvasHeight / 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, currentCanvasWidth, currentCanvasHeight);

    ctx.font = `${fontSize}px Calibri`;
    ctx.translate(translateX, translateY);
    ctx.rotate(radian);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(emoji, -fontSize / 2, +fontSize / 2);
    ctx.rotate(-radian);
    ctx.translate(-translateX, -translateY);
    degree++;
  };

  const intervalId = setInterval(() => {
    drawEmojii();
  }, 1000 / framerate);

  return {
    stream: canvasElement.captureStream(framerate),
    stop: () => {
      clearInterval(intervalId);
    },
  };
};
