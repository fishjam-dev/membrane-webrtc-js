export const canvasWidth = 320;
export const canvasHeight = 180;

export type Quality = "low" | "medium" | "high";
type QualityMultiplier = 1 | 2 | 4;

const QUALITY_MULTIPLIER: Record<Quality, QualityMultiplier> = {
  low: 1,
  medium: 2,
  high: 4,
};

let run: boolean;

self.onmessage = (event) => {
  if (event.data.action === "start") {
    run = true;
    const emoji = event.data.emoji;
    const canvasElement = event.data.canvas;
    const quality: Quality = event.data.quality;
    const backgroundColor: string = event.data.backgroundColor;

    const multiplier = QUALITY_MULTIPLIER[quality];
    const currentCanvasWidth = canvasWidth * multiplier;
    const currentCanvasHeight = canvasHeight * multiplier;

    canvasElement.width = currentCanvasWidth;
    canvasElement.height = currentCanvasHeight;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) throw "ctx is null";
    const fontSize = 120 * multiplier;

    let degree = 0;

    let prevTimestamp: number = 0;
    const drawEmoji = (time: DOMHighResTimeStamp) => {
      const dt = time - prevTimestamp;

      const radian = (degree / 360) * 2 * Math.PI;
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
      degree += dt / 10;
      prevTimestamp = time;
      if (run) {
        requestAnimationFrame(drawEmoji);
      }
    };

    requestAnimationFrame(drawEmoji);
  } else if (event.data.action === "stop") {
    run = false;
  }
};
