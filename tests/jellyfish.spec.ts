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

  await assertThatOtherIsSeen(firstPage, [secondClientId]);
  await assertThatOtherIsSeen(secondPage, [firstClientId]);

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

  await assertThatOtherIsSeen(firstPage, [secondClientId]);
  await assertThatOtherVideoIsPlaying(firstPage);
  await firstPage.getByRole("button", { name: "l", exact: true }).click();
  await assertThatOtherVideoIsPlaying(firstPage);
});

test("properly sees 9 other peers", async ({ page, context }) => {
  const pages = [page, ...(await Promise.all([...Array(9)].map(() => context.newPage())))];

  const roomRequest = await page.request.post("http://localhost:5002/room");
  const roomId = (await roomRequest.json()).data.room.id as string;

  const peerIds = await Promise.all(
    pages.map(async (page) => {
      await page.goto("/");
      return await joinRoomAndAddTrack(page, roomId);
    }),
  );

  await Promise.all(
    pages.map(async (page, idx) => {
      await assertThatOtherIsSeen(
        page,
        peerIds.filter((id) => id !== peerIds[idx]),
      );
      await assertThatOtherVideoIsPlaying(page);
    }),
  );
});

test("see peers just in the same room", async ({ page, context }) => {
  const [p1r1, p2r1, p1r2, p2r2] = [page, ...(await Promise.all([...Array(3)].map(() => context.newPage())))];
  const [firstRoomPages, secondRoomPages] = [
    [p1r1, p2r1],
    [p1r2, p2r2],
  ];

  const firstRoomRequest = await page.request.post("http://localhost:5002/room");
  const secondRoomRequest = await page.request.post("http://localhost:5002/room");
  const firstRoomId = (await firstRoomRequest.json()).data.room.id as string;
  const secondRoomId = (await secondRoomRequest.json()).data.room.id as string;

  const firstRoomPeerIds = await Promise.all(
    firstRoomPages.map(async (page) => {
      await page.goto("/");
      return await joinRoomAndAddTrack(page, firstRoomId);
    }),
  );

  const secondRoomPeerIds = await Promise.all(
    secondRoomPages.map(async (page) => {
      await page.goto("/");
      return await joinRoomAndAddTrack(page, secondRoomId);
    }),
  );

  await Promise.all([
    ...firstRoomPages.map(async (page, idx) => {
      await assertThatOtherIsSeen(
        page,
        firstRoomPeerIds.filter((id) => id !== firstRoomPeerIds[idx]),
      );
      await expect(assertThatOtherIsSeen(page, secondRoomPeerIds)).rejects.toThrow();
      await assertThatOtherVideoIsPlaying(page);
    }),
    ...secondRoomPages.map(async (page, idx) => {
      await assertThatOtherIsSeen(
        page,
        secondRoomPeerIds.filter((id) => id !== secondRoomPeerIds[idx]),
      );
      await expect(assertThatOtherIsSeen(page, firstRoomPeerIds)).rejects.toThrow();
      await assertThatOtherVideoIsPlaying(page);
    }),
  ]);
});

test("throws an error if joining room at max capacity", async ({ page, context }) => {
  const [page1, page2, overflowingPage] = [page, ...(await Promise.all([...Array(2)].map(() => context.newPage())))];

  const roomRequest = await page.request.post("http://localhost:5002/room", { data: { maxPeers: 2 } });
  const roomId = (await roomRequest.json()).data.room.id as string;

  await Promise.all(
    [page1, page2].map(async (page) => {
      await page.goto("/");
      return await joinRoomAndAddTrack(page, roomId);
    }),
  );

  await overflowingPage.goto("/");
  await expect(joinRoomAndAddTrack(overflowingPage, roomId)).rejects.toEqual({
    status: 503,
    response: {
      errors: `Reached peer limit in room ${roomId}`,
    },
  });
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
  try {
    const {
      peer: { id: peerId },
      token: peerToken,
    } = (await peerRequest.json()).data;

    await page.getByPlaceholder("token").fill(peerToken);
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(page.locator("#connection-status")).toContainText("true");
    await page.getByRole("button", { name: "Start screenshare", exact: true }).click();

    return peerId;
  } catch (e) {
    throw { status: peerRequest.status(), response: await peerRequest.json() };
  }
}

async function assertThatOtherIsSeen(page: Page, otherClientIds: string[]) {
  for (const peerId of otherClientIds) {
    await expect(page.locator(`css=video[data-peer-id="${peerId}"]`)).toBeVisible();
  }
}

async function assertThatOtherVideoIsPlaying(page: Page) {
  const getDecodedFrames: () => Promise<number> = () =>
    page.evaluate(async () => {
      const peerConnection = (window as typeof window & { webrtc: { connection: RTCPeerConnection } }).webrtc
        .connection;
      const stats = await peerConnection.getStats();
      for (const stat of stats.values()) {
        if (stat.type === "inbound-rtp") {
          return stat.framesDecoded;
        }
      }
    });
  const firstMeasure = await getDecodedFrames();
  await expect(async () => (await getDecodedFrames()) > firstMeasure).toPass();
}
