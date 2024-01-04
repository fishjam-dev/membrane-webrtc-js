import { expect, Page, test, TestInfo } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";

export const addScreenShare = async (page: Page) =>
  await test.step("Add screenshare", async () => {
    await page.getByRole("button", { name: "Start screenshare", exact: true }).click();
  });

export const createAndJoinPeer = async (page: Page, roomId: string): Promise<string> =>
  test.step("Create and join peer", async () => {
    const peerRequest = await createPeer(page, roomId);
    try {
      const {
        peer: { id: peerId },
        token: peerToken,
      } = (await peerRequest.json()).data;

      await test.step("Join room", async () => {
        await page.getByPlaceholder("token").fill(peerToken);
        await page.getByRole("button", { name: "Connect", exact: true }).click();
        await expect(page.locator("#connection-status")).toContainText("true");
      });

      return peerId;
    } catch (e) {
      throw { status: peerRequest.status(), response: await peerRequest.json() };
    }
  });

export const joinRoomAndAddScreenShare = async (page: Page, roomId: string): Promise<string> =>
  test.step("Join room and add track", async () => {
    const peerRequest = await createPeer(page, roomId);
    try {
      const {
        peer: { id: peerId },
        token: peerToken,
      } = (await peerRequest.json()).data;

      await test.step("Join room", async () => {
        await page.getByPlaceholder("token").fill(peerToken);
        await page.getByRole("button", { name: "Connect", exact: true }).click();
        await expect(page.locator("#connection-status")).toContainText("true");
      });

      await addScreenShare(page);

      return peerId;
    } catch (e) {
      throw { status: peerRequest.status(), response: await peerRequest.json() };
    }
  });

export const throwIfRemoteTracksAreNotPresent = async (page: Page, otherClientIds: string[]) => {
  await test.step("Assert that remote tracks are visible", async () => {
    for (const peerId of otherClientIds) {
      await expect(page.locator(`css=video[data-peer-id="${peerId}"]`)).toBeVisible();
    }
  });
};

export const assertThatRemoteTracksAreVisible = async (page: Page, otherClientIds: string[]) => {
  await test.step("Assert that remote tracks are visible", async () => {
    const responses = await Promise.allSettled(
      otherClientIds.map((peerId) => page.locator(`css=video[data-peer-id="${peerId}"]`)),
    );
    const isAnyRejected = responses.some((e) => e.status === "rejected");
    expect(isAnyRejected).toBe(false);
  });
};

type WebrtcClient = { webrtc?: { connection?: RTCPeerConnection } };
type WindowType = typeof window;

export const assertThatOtherVideoIsPlaying = async (page: Page) => {
  await test.step("Assert that media is working", async () => {
    const getDecodedFrames: () => Promise<number> = () =>
      page.evaluate(async () => {
        const connection = (window as WindowType & WebrtcClient)?.webrtc?.connection;
        // connection object is available after first renegotiation (sdpOffer, sdpAnswer)
        if (!window || !connection) return -1;
        const stats = await connection.getStats();
        for (const stat of stats.values()) {
          if (stat.type === "inbound-rtp") {
            return stat.framesDecoded;
          }
        }
        return 0;
      });
    const firstMeasure = await getDecodedFrames();
    await expect(async () => expect((await getDecodedFrames()) > firstMeasure).toBe(true)).toPass();
  });
};

export const takeScreenshot = async (page: Page, testInfo: TestInfo, name?: string) =>
  await test.step("Take screenshot", async () => {
    const screenShotId = uuidv4();
    const screenshot = await page.screenshot({ path: `test-results/screenshots/${screenShotId}.png` });
    await testInfo.attach(name ?? "screenshot", { body: screenshot, contentType: "image/png" });
  });

export const createRoom = async (page: Page, maxPeers?: number) =>
  await test.step("Create room", async () => {
    const data = {
      ...(maxPeers ? { maxPeers } : {}),
    };

    const roomRequest = await page.request.post("http://localhost:5002/room", { data });
    return (await roomRequest.json()).data.room.id as string;
  });

export const createPeer = async (page: Page, roomId: string, enableSimulcast: boolean = true) =>
  await test.step("Create room", async () => {
    return await page.request.post("http://localhost:5002/room/" + roomId + "/peer", {
      data: {
        type: "webrtc",
        options: {
          enableSimulcast,
        },
      },
    });
  });
