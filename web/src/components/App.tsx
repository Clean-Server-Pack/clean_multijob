import { MantineProvider } from '@mantine/core';
import '@mantine/dates/styles.css';
import React, { useEffect, useState } from "react";
import { JobProvider } from '../providers/jobs/jobs';
import { useSettings } from '../providers/settings/settings';
import theme from '../theme';
import "./App.css";
import Bar from './Bar';
import '@mantine/charts/styles.css';
import Content from './Content';

const App: React.FC = () => {
  const [curTheme, setCurTheme] = useState(theme);
  const settings = useSettings();
  // Ensure the theme is updated when the settings change

  useEffect(() => {
    const updatedTheme = {
      ...theme, // Start with the existing theme object
      colors: {
        ...theme.colors, // Copy the existing colors
        custom: settings.customTheme || theme.colors?.custom
      },
      primaryColor: settings.primaryColor,
      primaryShade: settings.primaryShade,
    };

    setCurTheme(updatedTheme);
  }, [settings]);
  
  return (
        
    <MantineProvider theme={curTheme} defaultColorScheme='dark'>
      <JobProvider>
        <Bar />
        <Content />
      </JobProvider>
    </MantineProvider>
  );
};

export default App;
