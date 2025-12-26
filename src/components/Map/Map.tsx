import { type FC, useEffect, useState, type MouseEvent } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  CircleMarker,
  ZoomControl,
} from 'react-leaflet'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  styled,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import type { CSSProperties } from '@mui/material'
import 'leaflet-providers'
import { type MapProvider, mapProviders } from '@/utils/providers.ts'
import { useLogStore } from '@/store/log.ts'
import { useMapPositions } from '@/hooks/useMapPositions'
import { StartIcon } from '@/components/icons/StartIcon'
import { FinishIcon } from '@/components/icons/FinishIcon'
import MapLogPathRenderer, {
  type GetSegmentConfig,
} from '../MapPolylines/MapLogPathRenderer'

interface Props {
  segmentDataCallback: GetSegmentConfig
  hoveredPoint?: { second: number } | null
  fullscreen?: boolean
}

const getMapStyles = (fullscreen?: boolean): CSSProperties => ({
  width: '100%',
  height: fullscreen ? '100%' : undefined,
  minHeight: fullscreen ? '100%' : '500px',
  borderRadius: fullscreen ? 0 : '4px',
})

const StyledSettingsContainer = styled(Box)({
  position: 'absolute',
  top: 80,
  right: 10,
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: '4px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
})

const StyledContainer = styled(Box)<{ fullscreen?: boolean }>(({ fullscreen }) => ({
  position: 'relative',
  width: fullscreen ? '100%' : undefined,
  height: fullscreen ? '100%' : undefined,
}))

const Map: FC<Props> = ({ segmentDataCallback, hoveredPoint, fullscreen }) => {
  const { log } = useLogStore()
  const [selectedProvider, setSelectedProvider] = useState<MapProvider>(
    mapProviders[0],
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [hoveredPosition, setHoveredPosition] = useState<
    [number, number] | null
  >(null)

  const {
    startPosition,
    finishPosition,
    centerPosition,
    initCenterPosition,
    initPath,
    initStartPosition,
    initFinishPosition,
  } = useMapPositions(log)

  useEffect(() => {
    initCenterPosition()
    initPath()
    initStartPosition()
    initFinishPosition()
  }, [log, initCenterPosition, initPath, initStartPosition, initFinishPosition])

  // Update hovered position when hoveredPoint changes
  useEffect(() => {
    if (!hoveredPoint || !log) {
      setHoveredPosition(null)
      return
    }

    // Find the closest record to the hovered second
    const record = log.records.find(
      (record) => Math.abs(record.flightTimeSec - hoveredPoint.second) < 0.1,
    )

    if (record && record.coordinates) {
      setHoveredPosition([record.coordinates.lat, record.coordinates.lng])
    } else {
      setHoveredPosition(null)
    }
  }, [hoveredPoint, log])

  const handleSettingsClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProviderSelect = (provider: MapProvider) => {
    setSelectedProvider(provider)
    handleClose()
  }

  return (
    <>
      {centerPosition && (
        <StyledContainer fullscreen={fullscreen}>
          <StyledSettingsContainer>
            <IconButton
              onClick={handleSettingsClick}
              size="small"
              sx={{ margin: 1, color: 'grey' }}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {mapProviders.map((provider) => (
                <MenuItem
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider)}
                  selected={selectedProvider.name === provider.name}
                >
                  <ListItemText primary={provider.name} />
                </MenuItem>
              ))}
              <Divider />
              <MenuItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      name="altitude"
                      size="small"
                      sx={{ padding: '6px' }}
                    />
                  }
                  label="Altitude"
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      name="battery"
                      size="small"
                      sx={{ padding: '6px' }}
                    />
                  }
                  label="Battery"
                />
              </MenuItem>
            </Menu>
          </StyledSettingsContainer>

          <MapContainer center={centerPosition} zoom={16} style={getMapStyles(fullscreen)} zoomControl={false}>
            <ZoomControl position="topright" />
            <TileLayer
              key={selectedProvider.name}
              attribution={selectedProvider.attribution}
              url={selectedProvider.url}
            />
            {startPosition && (
              <Marker position={startPosition} icon={StartIcon}>
                <Popup>Flight origin point</Popup>
              </Marker>
            )}

            {finishPosition && (
              <Marker position={finishPosition} icon={FinishIcon}>
                <Popup>Flight end point</Popup>
              </Marker>
            )}

            <MapLogPathRenderer getConfig={segmentDataCallback} />

            {hoveredPosition && (
              <CircleMarker
                center={hoveredPosition as [number, number]}
                radius={8}
                pathOptions={{
                  fillColor: '#ffffffff',
                  fillOpacity: 0.9,
                  weight: 2,
                  color: '#000',
                  opacity: 1,
                }}
              >
                <Popup>Hovered position</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </StyledContainer>
      )}
    </>
  )
}

export default Map
