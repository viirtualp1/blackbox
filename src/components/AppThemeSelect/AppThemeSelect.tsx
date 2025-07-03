import type { FC } from 'react'
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import DesktopIcon from '@mui/icons-material/DesktopMac'

const styles = {
  container: {
    position: 'absolute',
    top: '12px',
    right: '24px',
  },
}

const AppThemeSelect: FC = () => {
  const { mode, setMode } = useColorScheme()

  const setTheme = (_: Event, newTheme: string) => {
    setMode(newTheme as 'system' | 'light' | 'dark')
  }

  return (
    <Box sx={styles.container}>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={setTheme}
        aria-label="set theme"
      >
        <ToggleButton value="light" aria-label="left aligned">
          <LightModeIcon />
        </ToggleButton>
        <ToggleButton value="dark" aria-label="centered">
          <DarkModeIcon />
        </ToggleButton>
        <ToggleButton value="system" aria-label="centered">
          <DesktopIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

export default AppThemeSelect
