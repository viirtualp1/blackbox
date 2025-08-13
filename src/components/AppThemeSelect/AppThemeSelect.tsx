import type { FC, MouseEvent } from 'react'
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  IconButton,
} from '@mui/material'
import { useColorScheme } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import DesktopIcon from '@mui/icons-material/DesktopMac'
import GitHubIcon from '@mui/icons-material/GitHub'

const styles = {
  container: {
    position: 'absolute',
    top: '12px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
}

const AppThemeSelect: FC = () => {
  const { mode, setMode } = useColorScheme()

  const setTheme = (_: MouseEvent<HTMLElement>, newTheme: string) => {
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
      <Link
        href="https://github.com/viirtualp1/blackbox"
        target="_blank"
        rel="noopener"
      >
        <IconButton>
          <GitHubIcon />
        </IconButton>
      </Link>
    </Box>
  )
}

export default AppThemeSelect
