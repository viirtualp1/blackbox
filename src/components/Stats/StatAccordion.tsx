import { type FC } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StatTable from './StatTable'
import type { StatSection } from './types'

interface Props {
  section: StatSection
}

const StatAccordion: FC<Props> = ({ section }) => {
  const { title, icon: Icon, data, type } = section

  return (
    <Accordion color="dark" disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Icon sx={{ mr: 1 }} />
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <StatTable data={data} type={type} />
      </AccordionDetails>
    </Accordion>
  )
}

export default StatAccordion
