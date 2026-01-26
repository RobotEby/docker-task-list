import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarProps as AriaCalendarProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  DateValue,
  Heading,
  Text,
  useLocale,
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: string,
): string | ((v: T) => string) {
  return composeRenderProps(className, (className) => twMerge(tw, className));
}

const focusRing = tv({
  base: 'outline outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight] outline-offset-2',
  variants: {
    isFocusVisible: {
      false: 'outline-0',
      true: 'outline-2',
    },
  },
});

const cellStyles = tv({
  extend: focusRing,
  base: 'w-9 h-9 text-sm cursor-pointer rounded-md flex items-center justify-center forced-color-adjust-none transition-colors',
  variants: {
    isSelected: {
      false: 'text-foreground hover:bg-accent hover:text-accent-foreground pressed:bg-accent/80',
      true: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    isDisabled: {
      true: 'text-muted-foreground opacity-50 cursor-not-allowed',
    },
    isUnavailable: {
      true: 'text-destructive decoration-destructive line-through',
    },
  },
});

const navButtonStyles = tv({
  extend: focusRing,
  base: 'w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer',
});

function CalendarNavigationButton(props: AriaButtonProps) {
  return (
    <AriaButton
      {...props}
      className={composeTailwindRenderProps(props.className, navButtonStyles({}))}
    />
  );
}

function WeekHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="text-xs text-muted-foreground font-medium w-9 pb-2">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}

function CalendarHeader() {
  const { direction } = useLocale();

  return (
    <header className="flex items-center justify-between pb-4 px-1">
      <Heading className="text-sm font-semibold text-foreground capitalize" />
      <div className="flex items-center gap-1">
        <CalendarNavigationButton slot="previous">
          {direction === 'rtl' ? (
            <ChevronRight aria-hidden size={16} />
          ) : (
            <ChevronLeft aria-hidden size={16} />
          )}
        </CalendarNavigationButton>
        <CalendarNavigationButton slot="next">
          {direction === 'rtl' ? (
            <ChevronLeft aria-hidden size={16} />
          ) : (
            <ChevronRight aria-hidden size={16} />
          )}
        </CalendarNavigationButton>
      </div>
    </header>
  );
}

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  'visibleDuration'
> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>({ errorMessage, ...props }: CalendarProps<T>) {
  return (
    <AriaCalendar
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'p-3 w-fit border border-border rounded-lg bg-popover text-popover-foreground shadow-sm',
      )}
    >
      <CalendarHeader />

      <CalendarGrid className="border-spacing-1 border-collapse">
        <WeekHeader />
        <CalendarGridBody className="mt-2">
          {(date) => <CalendarCell date={date} className={cellStyles} />}
        </CalendarGridBody>
      </CalendarGrid>

      {errorMessage && (
        <Text slot="errorMessage" className="text-sm text-destructive mt-2">
          {errorMessage}
        </Text>
      )}
    </AriaCalendar>
  );
}
