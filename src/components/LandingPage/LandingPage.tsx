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
      <h1>Blackbox</h1>

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
