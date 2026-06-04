import { Clock2Icon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { type DateRange } from "react-day-picker"

type Props = {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export const RangeCalendarComponent = ({ dateRange, setDateRange }: Props) => {

  return (
    <>
      <Card size="sm" className="mx-auto w-fit card-base">
        <CardContent>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            disabled={(date) =>
              date < new Date("1900-01-01") || date < new Date()
            }
          />
        </CardContent>
        <CardFooter className="border-t bg-card">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="time-from">Start Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-from"
                  type="time"
                  step="1"
                  defaultValue="12:00:00"
                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
                <InputGroupAddon>
                  <Clock2Icon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="time-to">End Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-to"
                  type="time"
                  step="1"
                  defaultValue="12:00:00"
                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
                <InputGroupAddon>
                  <Clock2Icon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </CardFooter>
      </Card>
    </>
  )
}