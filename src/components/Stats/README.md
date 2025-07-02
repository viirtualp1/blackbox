# Stats Component Refactoring

## Overview

The Stats component has been refactored to follow React best practices and improve maintainability.

## File Structure

```
src/components/Stats/
├── index.ts                 # Barrel export
├── Stats.tsx               # Main component (simplified)
├── StatAccordion.tsx       # Reusable accordion wrapper
├── StatTable.tsx           # Reusable table component
├── types.ts                # TypeScript interfaces
├── utils.ts                # Utility functions
└── useStatSections.ts      # Data transformation logic
```

## Components

### Stats.tsx

The main component, now simplified to just iterate over sections and render accordions.

### StatAccordion.tsx

Reusable component that wraps a section with Material-UI Accordion.

- Accepts a `StatSection` object
- Renders icon, title, and table content

### StatTable.tsx

Reusable table component that handles both table types:

- `minMaxAvg`: Tables with Average, Min, Max columns
- `valueOnly`: Tables with single Value column

### useStatSections.ts

Hook/function that transforms raw statistics into structured sections.

- Separates data transformation from presentation
- Makes it easy to add new sections or modify existing ones

## Benefits of Refactoring

### 1. **Single Responsibility Principle**

- Each component has one clear purpose
- Data formatting is separated from presentation
- Business logic is isolated in `useStatSections`

### 2. **DRY (Don't Repeat Yourself)**

- Eliminated 6 nearly identical accordion/table structures
- Reusable `StatTable` component handles both table types
- Common utilities are extracted

### 3. **Better Type Safety**

- Proper TypeScript interfaces for all data structures
- Type-safe props for all components

### 4. **Easier Testing**

- Small, focused components are easier to unit test
- Utility functions can be tested independently
- Data transformation logic is isolated

### 5. **Improved Maintainability**

- Adding new stat sections only requires updating `useStatSections`
- Table structure changes only need to be made in `StatTable`
- Formatting logic is centralized in `utils.ts`

### 6. **Better Performance**

- Smaller component functions
- Cleaner re-render patterns
- Potential for component memoization if needed

## Usage

```tsx
import Stats from '@/components/Stats'

// In your component
;<Stats stat={logStatistics} />
```

## Adding New Sections

To add a new statistics section:

1. Import the required icon from Material-UI icons
2. Add a new section object to the array in `useStatSections.ts`
3. Specify the type (`minMaxAvg` or `valueOnly`)
4. Provide the data array with proper formatting

Example:

```ts
{
  title: 'Battery Stats',
  icon: BatteryIcon,
  type: 'minMaxAvg',
  data: [
    {
      metric: 'Voltage (V)',
      avg: stat.voltage.average.toFixed(2),
      min: stat.voltage.min.toFixed(2),
      max: stat.voltage.max.toFixed(2),
    },
  ],
}
```

## Future Improvements

1. **Memoization**: Consider using `React.memo` for components if performance becomes an issue
2. **Custom Hooks**: Extract accordion state management if needed
3. **Theming**: Add consistent spacing and styling through theme
4. **Internationalization**: Add i18n support for metric names and units
5. **Data Validation**: Add runtime validation for statistics data
6. **Loading States**: Add skeleton loaders for better UX
