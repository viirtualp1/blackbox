import { type ChangeEvent, type FC, Fragment } from 'react'
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state'
import { Box, IconButton, Menu, styled } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useChartSettingsStore } from '@/store/chart-settings.ts'
import SettingItem from './SettingItem'

const FloatingSettingsBox = styled(Box)({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: '4px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
})

const LogChartSettings: FC = () => {
  const { settings, setSettings } = useChartSettingsStore()

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target

    setSettings({
      ...settings,
      [name]: checked,
    })
  }

  const simpleLogFields: (keyof typeof settings)[] = [
    'altitudeM',
    'groundSpeedKmh',
    'verticalSpeedMps',
    'amperageCurrentA',
    'transmitterLinkQuality',
    'recieverLinkQuality',
  ]

  return (
    <PopupState variant="popover">
      {(popupState) => (
        <Fragment>
          <FloatingSettingsBox>
            <IconButton
              size="small"
              sx={{ margin: 0.2 }}
              {...bindTrigger(popupState)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </FloatingSettingsBox>
          <Menu {...bindMenu(popupState)}>
            {simpleLogFields.map((field) => (
              <SettingItem
                key={field}
                name={field}
                checked={settings[field]}
                onChange={handleCheckboxChange}
              />
            ))}
          </Menu>
        </Fragment>
      )}
    </PopupState>
  )
}

export default LogChartSettings
