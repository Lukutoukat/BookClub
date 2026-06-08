import { useState } from "react"
import { Clock2Icon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SectionHeader } from './SectionHeader'

import { type DateRange } from "react-day-picker"

type Props = {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export const RangeCalendarComponent = ({ dateRange, setDateRange }: Props) => {
  const [startTime, setStartTime] = useState("12:00:00")
  const [endTime, setEndTime] = useState("12:00:00")

  const applyTimeToDate = (date: Date, timeString: string): Date => {
    const newDate = new Date(date)
    const [hours, minutes, seconds] = timeString.split(":").map(Number)
    newDate.setHours(hours || 0, minutes || 0, seconds || 0, 0)
    return newDate
  }

  const handleDateSelect = (newRange: DateRange | undefined) => {
    if (!newRange) {
      setDateRange(undefined)
      return
    }

    const updatedRange: DateRange = { ...newRange }

    if (updatedRange.from) {
      updatedRange.from = applyTimeToDate(updatedRange.from, startTime)
    }
    if (updatedRange.to) {
      updatedRange.to = applyTimeToDate(updatedRange.to, endTime)
    }

    setDateRange(updatedRange)
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setStartTime(newTime)

    if (dateRange?.from) {
      setDateRange({
        ...dateRange,
        from: applyTimeToDate(dateRange.from, newTime),
      })
    }
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setEndTime(newTime)

    if (dateRange?.to) {
      setDateRange({
        ...dateRange,
        to: applyTimeToDate(dateRange.to, newTime),
      })
    }
  }

  return (
    <>
      <Card size="sm" className="mx-auto w-fit card-base">
        <SectionHeader
          title={"Select Dates"}
          description={"Select the end date the proposal phase and the end date for voting phase."}>
        </SectionHeader>
        <CardContent>
          <Calendar
            mode="range"
            defaultMonth={new Date()}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={(date) =>
              date < new Date("1900-01-01") || date < new Date()
            }
          />
        </CardContent>
        <CardFooter className="border-t bg-card">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="time-from">Proposal End Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-from"
                  type="time"
                  step="1"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  disabled={!dateRange?.from} // Disabled if no start date is selected
                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
                <InputGroupAddon>
                  <Clock2Icon className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="time-to">Voting End Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-to"
                  type="time"
                  step="60"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  disabled={!dateRange?.to} // Disabled if no end date is selected yet
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