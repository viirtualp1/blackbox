import { type FC } from 'react'
import { Typography } from '@mui/material'
import type { LogStatistics } from '@/parse/types'
import StatAccordion from './StatAccordion'
import { useStatSections } from './useStatSections'

interface Props {
  stat: LogStatistics
}

const Stats: FC<Props> = ({ stat }) => {
  const sections = useStatSections(stat)

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Flight Statistics
      </Typography>

      {sections.map((section) => (
        <StatAccordion key={section.title} section={section} />
      ))}
    </div>
  )
}

export default Stats
