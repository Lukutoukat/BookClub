// src/components/ui/time-picker.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimePickerProps = {
  value: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  disabled?: boolean;
};

export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  // Extract just the hour, as minutes will be locked
  const [hours] = value.split(":");

  const handleHourChange = (newHour: string) => {
    // Hardcode minutes to "00" whenever the hour changes
    onChange(`${newHour}:00`);
  };

  // Generate 24 hours (00-23)
  const hoursList = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <div className="flex items-center gap-2">
      {/* Interactive Hours Dropdown */}
      <Select
        disabled={disabled}
        value={hours}
        onValueChange={handleHourChange}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hoursList.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground font-bold">:</span>

      {/* Disabled Minutes Dropdown (Not Selectable) */}
      <Select disabled value="00">
        <SelectTrigger className="w-[70px] opacity-50 cursor-not-allowed">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {/* Even though it's disabled, we provide the option so the UI renders correctly */}
          <SelectItem value="00">00</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}