import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: "815xxsit", dataset: "production" },
  // Studio URL once deployed: https://vitalita.sanity.studio
  studioHost: "vitalita",
  deployment: { appId: "hhzrc7e2w3hysmgvepvfxawm", autoUpdates: true },
});
