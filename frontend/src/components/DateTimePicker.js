'use client';

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function DateTimePicker({ value, onChange }) {
  const [date, time] = value ? value.split("T") : ["", "12:00"];
  const selectedDate = date ? new Date(date + "T00:00:00") : undefined;

  function handleDateSelect(newDate) {
    if (!newDate) return;
    const isoDate = newDate.toISOString().slice(0, 10);
    onChange(`${isoDate}T${time || "12:00"}`);
  }

  function handleTimeChange(e) {
    const newTime = e.target.value;
    const isoDate = date || new Date().toISOString().slice(0, 10);
    onChange(`${isoDate}T${newTime}`);
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-accent"
          >
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            {selectedDate ? selectedDate.toLocaleDateString("es-CO") : "Selecciona fecha"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} />
        </PopoverContent>
      </Popover>

      <input 
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-accent scheme:dark"
      />
    </div>
  )
}