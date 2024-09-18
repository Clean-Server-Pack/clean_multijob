import { MantineColor, MantineColorShade } from "@mantine/core";

export type SettingsProps = {
  primaryColor: MantineColor;
  primaryShade: MantineColorShade;
  enableTimeTracking: boolean;
  jobCounts: boolean;
  unemployedJob: string;

  // Add more settings here
};
