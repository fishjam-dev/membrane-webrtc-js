import { expect, Page, test, TestInfo } from "@playwright/test";
import { createAndJoinPeer, createRoom, takeScreenshot } from "./utils";

/*
 * Test in this file should be run a few times in a row to be sure that there is no race conditions.
 * To run a test multiple times use command:
 *
 * npm run e2e -- --repeat-each=20 -g "Test name"
 */

/*
 * This is the happy path test and everything should work every time. There should not be any RC.
 */
test("Add 2 tracks separately", async ({ page: senderPage, context }, testInfo) => {
  // given
  await senderPage.goto("/");
  const roomId = await createRoom(senderPage);
  const senderId = await createAndJoinPeer(senderPage, roomId);

  // when
  await addOneTrack(senderPage, "Add a heart");
  await senderPage.waitForTimeout(500);
  await addOneTrack(senderPage, "Add a brain");

  // then
  const receiverPage = await context.newPage();
  await receiverPage.goto("/");
  await createAndJoinPeer(receiverPage, roomId);

  await assertThatAllTracksAreReady(receiverPage, senderId, 2);
  await assertThatBothTrackAreDifferent(receiverPage, testInfo);
});


test("RC: Add 2 tracks at the same time should not send the same one twice", async ({ page: senderPage, context }, testInfo) => {
  // given
  await senderPage.goto("/");
  const roomId = await createRoom(senderPage);

  const senderId = await createAndJoinPeer(senderPage, roomId);

  // when
  await addBothMockTracks(senderPage);

  // then
  const receiverPage = await context.newPage();
  await receiverPage.goto("/");
  await createAndJoinPeer(receiverPage, roomId);

  await assertThatAllTracksAreReady(receiverPage, senderId, 2);
  await assertThatBothTrackAreDifferent(receiverPage, testInfo);
});


/*
 * This test reveals 2 race conditions:
 *
 * 1)
 * Adding track in the middle of renegotiation could result in adding the same track twice.
 *
 * server: tracksAdded       (REMOTE TRACK ADDED)
 * server: offerData         (REMOTE TRACK ADDED)
 * client: sdpOffer          (REMOTE TRACK ADDED)
 * client: renegotiateTracks (ADD LOCAL TRACK)
 * server: sdpAnswer         (REMOTE TRACK ADDED)
 * client: renegotiateTracks (ADD LOCAL TRACK) - error - same track added two times
 *
 * 2)
 * If client and server invoke renegotiation (client: addTrack, server: tracksRemoved)
 * there will be only one offerData, sdpOffer, sdpAnswer cycle, not two.
 *
 * client: renegotiateTracks (ADD LOCAL TRACK)
 * server: tracksRemoved     (REMOTE TRACK REMOVED)
 * server: offerData
 * client: sdpOffer
 * server: sdpAnswer
 */
test("RC: Add 2 tracks at the same time and remove one track", async ({ page: sender1Page, context }, testInfo) => {
  // given
  await sender1Page.goto("/");
  const roomId = await createRoom(sender1Page);
  const sender1Id = await createAndJoinPeer(sender1Page, roomId);
  await sender1Page.waitForTimeout(500);

  const sender2Page = await context.newPage();
  await sender2Page.goto("/");
  const sender2Id = await createAndJoinPeer(sender2Page, roomId);
  await addOneTrack(sender2Page, "Add a heart");
  await sender2Page.waitForTimeout(500);
  await addOneTrack(sender2Page, "Add a brain");

  // when
  await addBothMockTracks(sender1Page);
  await removeTrack(sender2Page, "Remove a heart");

  // then
  await assertThatAllTracksAreReady(sender2Page, sender1Id, 2);
  await assertThatBothTrackAreDifferent(sender2Page, testInfo);

  await assertThatAllTracksAreReady(sender1Page, sender2Id, 1);
  await takeScreenshot(sender1Page, testInfo);
});

export const addBothMockTracks = async (page: Page) =>
  await test.step("Add both tracks", async () =>
    await page
      .getByRole("button", {
        name: "Add both",
        exact: true,
      })
      .click());

export const assertThatAllTracksAreReady = async (page: Page, otherClientId: string, tracks: number) =>
  await test.step("Assert that all tracks are ready", async () =>
    await expect(async () =>
      expect((await page.locator(`div[data-endpoint-id="${otherClientId}"]`).all()).length).toBe(tracks),
    ).toPass());

export const assertThatTrackIdIsNotEmpty = async (page: Page, locator: string) =>
  await test.step("Assert that track id is not empty", async () =>
    await expect(async () => {
      expect((await page.locator(locator).textContent())?.trim()?.length ?? 0).toBeGreaterThan(0);
    }).toPass());

export const assertThatBothTrackAreDifferent = async (page: Page, testInfo: TestInfo) => {
  await test.step("Assert that both tracks are different", async () => {
    const locator1 = `(//div[@data-name="stream-id"])[1]`;
    const locator2 = `(//div[@data-name="stream-id"])[2]`;

    await assertThatTrackIdIsNotEmpty(page, locator1);
    await assertThatTrackIdIsNotEmpty(page, locator2);

    await takeScreenshot(page, testInfo);

    const text1 = await page.locator(locator1).textContent();
    const text2 = await page.locator(locator2).textContent();

    expect(text1 !== "").toBe(true);
    expect(text2 !== "").toBe(true);
    expect(text1 !== text2).toBe(true);
  });
};

export const addOneTrack = async (page: Page, name: string) =>
  await test.step(`Add '${name}' track`, async () => {
    await page.getByRole("button", { name: name, exact: true }).click();
  });

export const removeTrack = async (page: Page, button: string) =>
  await test.step(`Remove track ${button}`, async () => {
    await page.getByRole("button", { name: button, exact: true }).click();
  });
