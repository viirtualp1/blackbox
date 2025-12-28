import { type FC } from 'react'
import MuiAccordion, { type AccordionProps } from '@mui/material/Accordion'
import {
  AccordionSummary,
  AccordionDetails,
  Typography,
  styled,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StatTable from './StatTable'
import type { StatSection } from './types'

interface Props {
  section: StatSection
  expanded: boolean
  onChange: (expanded: boolean) => void
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const StatAccordion: FC<Props> = ({ section, expanded, onChange }) => {
  const { title, icon: Icon, data, type } = section

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onChange(isExpanded)}
    >
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
