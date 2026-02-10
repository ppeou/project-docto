import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { Calendar } from './Calendar.jsx';
import { Popover, PopoverContent, PopoverTrigger } from './Popover.jsx';

/**
 * DatePicker - A reusable date picker component with calendar UI
 * 
 * @param {Object} props
 * @param {string} props.value - The date value in YYYY-MM-DD format
 * @param {Function} props.onChange - Callback when date changes (receives event)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.min - Minimum date in YYYY-MM-DD format
 * @param {string} props.max - Maximum date in YYYY-MM-DD format
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props...rest - Other standard input props
 */
const DatePicker = React.forwardRef(
  (
    {
      value,
      onChange,
      className,
      disabled = false,
      min,
      max,
      id,
      name,
      required,
      placeholder = 'Pick a date',
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const inputRef = React.useRef(null);

    // Parse the value string to a Date object
    const selectedDate = React.useMemo(() => {
      if (!value) return null;
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : null;
    }, [value]);

    // Parse min/max dates
    const minDate = React.useMemo(() => {
      if (!min) return undefined;
      const parsed = parse(min, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : undefined;
    }, [min]);

    const maxDate = React.useMemo(() => {
      if (!max) return undefined;
      const parsed = parse(max, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : undefined;
    }, [max]);

    // Format date for display - using PPP format like shadcn/ui
    const displayValue = selectedDate ? format(selectedDate, 'PPP') : '';

    const handleDateSelect = (date) => {
      if (!date) {
        // Allow clearing the date
        const syntheticEvent = {
          target: {
            value: '',
            name: name,
            id: id,
          },
        };
        if (onChange) {
          onChange(syntheticEvent);
        }
        return;
      }
      
      // Format as YYYY-MM-DD
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Create a synthetic event to match the expected onChange signature
      const syntheticEvent = {
        target: {
          value: formattedDate,
          name: name,
          id: id,
        },
      };
      
      if (onChange) {
        onChange(syntheticEvent);
      }
      
      setOpen(false);
    };

    // Handle direct input changes (for form submission - hidden input)
    const handleInputChange = (e) => {
      // This is just for form submission compatibility
      // The actual date selection happens through the calendar
      if (onChange) {
        onChange(e);
      }
    };

    React.useImperativeHandle(ref, () => inputRef.current);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              data-empty={!displayValue}
              className={cn(
                // Button base styles (matching Button component outline variant exactly)
                'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
                'ring-offset-background transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                // Outline variant
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                // DatePicker specific (matching shadcn/ui)
                'w-full justify-start text-left font-normal',
                'h-10 px-3 py-2',
                'data-[empty=true]:text-muted-foreground',
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayValue ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
            </button>
          </PopoverTrigger>
          
          {/* Hidden input for form submission */}
          <input
            ref={inputRef}
            type="text"
            id={id}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            className="sr-only"
            {...props}
          />
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            fromDate={minDate}
            toDate={maxDate}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export { DatePicker };

