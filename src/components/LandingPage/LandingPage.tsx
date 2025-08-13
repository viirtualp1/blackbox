import { type ChangeEvent } from 'react'
import { Box, Button } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'

const styles = {
  initialContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

interface LandingPageProps {
  onUploadFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  onInitExampleFile: () => Promise<void>
}

function LandingPage({ onUploadFile, onInitExampleFile }: LandingPageProps) {
  return (
    <Box sx={styles.initialContainer}>
      <h1>EdgeTX Blackbox Visualization</h1>

      <Box sx={{ textAlign: 'center', maxWidth: '600px', marginBottom: 3 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 400, margin: '16px 0' }}>
          Analyze and Visualize Your RC Flight Data
        </h2>

        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            margin: '16px 0',
            color: 'text.secondary',
          }}
        >
          Professional blackbox log analysis tool for EdgeTX firmware. Upload
          your CSV flight logs to visualize flight paths, analyze telemetry
          data, and gain insights to improve your RC flying performance.
        </p>

        <Box sx={{ fontSize: '0.95rem', marginBottom: 2 }}>
          <p style={{ margin: '8px 0' }}>
            ✈️ <strong>Flight Path Visualization</strong> - Interactive maps
            showing your aircraft's route
          </p>
          <p style={{ margin: '8px 0' }}>
            📊 <strong>Telemetry Analysis</strong> - Detailed charts of
            altitude, speed, and control inputs
          </p>
          <p style={{ margin: '8px 0' }}>
            📈 <strong>Performance Statistics</strong> - Calculate derivatives
            and performance metrics
          </p>
          <p style={{ margin: '8px 0' }}>
            💾 <strong>Data Export</strong> - Convert logs to GPX and KML
            formats
          </p>
        </Box>
      </Box>

      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        size="large"
        startIcon={<CloudUploadIcon />}
      >
        Import .CSV file
        <VisuallyHiddenInput
          type="file"
          onChange={onUploadFile}
          accept=".csv"
        />
      </Button>
      <Button sx={{ marginTop: 1 }} size="small" onClick={onInitExampleFile}>
        Use example file
      </Button>
    </Box>
  )
}

export default LandingPage
