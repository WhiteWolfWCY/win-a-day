"use client";

import * as React from "react";
import { Input } from "./input";

interface TimePickerInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function TimePickerInput({ value, onChange, disabled }: TimePickerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    if (!timeString) return onChange?.(undefined);

    const date = new Date();
    const [hours, minutes] = timeString.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    onChange?.(date);
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Input
      type="time"
      value={formatTime(value)}
      onChange={handleChange}
      disabled={disabled}
    />
  );
} 