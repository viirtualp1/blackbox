import { type FC } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import type { StatTableRow } from './types'

interface Props {
  data: StatTableRow[]
  type: 'minMaxAvg' | 'valueOnly'
}

const StatTable: FC<Props> = ({ data, type }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        {type === 'minMaxAvg' && (
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">Avg</TableCell>
              <TableCell align="right">Min</TableCell>
              <TableCell align="right">Max</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.metric}>
              <TableCell component="th" scope="row">
                {row.metric}
              </TableCell>
              {type === 'minMaxAvg' ? (
                <>
                  <TableCell align="right">{row.avg}</TableCell>
                  <TableCell align="right">{row.min}</TableCell>
                  <TableCell align="right">{row.max}</TableCell>
                </>
              ) : (
                <TableCell align="right">{row.value}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default StatTable
