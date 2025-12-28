import { type FC, useState, useEffect } from 'react'
import type { LogStatistics } from '@/parse/types'
import StatAccordion from './StatAccordion'
import { useStatSections } from './useStatSections'

interface Props {
  stat: LogStatistics
  onExpandedChange?: (hasAnyExpanded: boolean) => void
}

const Stats: FC<Props> = ({ stat, onExpandedChange }) => {
  const sections = useStatSections(stat)
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({})

  const hasAnyExpanded = Object.values(expandedSections).some(Boolean)

  useEffect(() => {
    onExpandedChange?.(hasAnyExpanded)
  }, [hasAnyExpanded, onExpandedChange])

  const handleSectionChange = (title: string, expanded: boolean) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: expanded,
    }))
  }

  return (
    <div>
      {sections.map((section) => (
        <StatAccordion
          key={section.title}
          section={section}
          expanded={expandedSections[section.title] ?? false}
          onChange={(expanded) => handleSectionChange(section.title, expanded)}
        />
      ))}
    </div>
  )
}

export default Stats
