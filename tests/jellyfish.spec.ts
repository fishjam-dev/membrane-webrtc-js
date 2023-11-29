import { test, expect, Page } from "@playwright/test";

test("displays basic UI", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByPlaceholder("token")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start screenshare", exact: true })).toBeVisible();
});

test("connects to Jellyfish Server", async ({ page: firstPage, context }) => {
  const secondPage = await context.newPage();
  await firstPage.goto("/");
  await secondPage.goto("/");

  const roomRequest = await firstPage.request.post("http://localhost:5002/room");
  const roomId = (await roomRequest.json()).data.room.id as string;

  const firstClientId = await joinRoomAndAddTrack(firstPage, roomId);
  const secondClientId = await joinRoomAndAddTrack(secondPage, roomId);

  await assertThatOtherIsSeen(firstPage, secondClientId);
  await assertThatOtherIsSeen(secondPage, firstClientId);

  await Promise.all([assertThatOtherVideoIsPlaying(firstPage), assertThatOtherVideoIsPlaying(secondPage)]);
});

test("doesn't disconnect when trying to set incorrect track encoding", async ({ page: firstPage, context }) => {
  const secondPage = await context.newPage();
  await firstPage.goto("/");
  await secondPage.goto("/");

  const roomRequest = await firstPage.request.post("http://localhost:5002/room");
  const roomId = (await roomRequest.json()).data.room.id as string;

  await joinRoomAndAddTrack(firstPage, roomId);
  const secondClientId = await joinRoomAndAddTrack(secondPage, roomId);

  await assertThatOtherIsSeen(firstPage, secondClientId);
  await assertThatOtherVideoIsPlaying(firstPage);
  await firstPage.getByRole("button", { name: "l", exact: true }).click();
  await assertThatOtherVideoIsPlaying(firstPage);
});

async function joinRoomAndAddTrack(page: Page, roomId: string): Promise<string> {
  const peerRequest = await page.request.post("http://localhost:5002/room/" + roomId + "/peer", {
    data: {
      type: "webrtc",
      options: {
        enableSimulcast: true,
      },
    },
  });
  const {
    peer: { id: peerId },
    token: peerToken,
  } = (await peerRequest.json()).data;

  await page.getByPlaceholder("token").fill(peerToken);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Start screenshare", exact: true }).click();

  return peerId;
}

async function assertThatOtherIsSeen(page: Page, _otherClientId: string) {
  await expect(page.locator("video")).toBeVisible();
}

async function assertThatOtherVideoIsPlaying(page: Page) {
  const playing = await page.evaluate(async () => {
    const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const getDecodedFrames = async () => {
      const stats = await peerConnection.getStats();
      for (const stat of stats.values()) {
        if (stat.type === "inbound-rtp") {
          return stat.framesDecoded;
        }
      }
    };

    const peerConnection = (window as typeof window & { webrtc: { connection: RTCPeerConnection } }).webrtc.connection;
    const firstMeasure = await getDecodedFrames();
    await sleep(200);
    const secondMeasure = await getDecodedFrames();
    return secondMeasure > firstMeasure;
  });
  expect(playing).toBe(true);
}
