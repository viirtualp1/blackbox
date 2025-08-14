import type { FC } from 'react'
import SEO from './SEO'

const LandingPageSEO: FC = () => {
  return (
    <SEO
      title="EdgeTX Blackbox Visualization - Upload & Analyze RC Flight Logs"
      description="Upload your EdgeTX blackbox CSV logs and get instant flight path visualization, telemetry analysis, and performance insights. Free online tool for RC pilots."
      keywords="EdgeTX blackbox upload, CSV flight log analysis, RC flight visualization, telemetry data, flight path mapping, RC performance analysis"
      section="RC Flight Analysis"
      tags={['EdgeTX', 'Blackbox', 'RC Flying', 'Flight Analysis', 'Telemetry']}
    />
  )
}

export default LandingPageSEO
