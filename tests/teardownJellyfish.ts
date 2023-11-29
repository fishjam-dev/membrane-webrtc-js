import { setupState } from "./globalSetupState.js";

export default async function teardownJellyfish() {
  await setupState.jellyfishContainer?.down();
}
