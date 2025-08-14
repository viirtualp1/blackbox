import type { FC } from 'react'
import SEO from './SEO'

const MainPageSEO: FC = () => {
  return (
    <SEO
      title="EdgeTX Blackbox Analysis - Flight Path Visualization & Telemetry Charts"
      description="Interactive EdgeTX blackbox log analysis with 3D flight path visualization, real-time telemetry charts, altitude graphs, and performance statistics. Professional RC flight data analysis tool."
      keywords="EdgeTX analysis, flight path visualization, telemetry charts, altitude graphs, RC performance stats, blackbox data analysis, 3D flight mapping"
      section="RC Flight Analysis"
      tags={[
        'EdgeTX Analysis',
        'Flight Visualization',
        'Telemetry Charts',
        'Performance Stats',
        '3D Mapping',
      ]}
    />
  )
}

export default MainPageSEO
