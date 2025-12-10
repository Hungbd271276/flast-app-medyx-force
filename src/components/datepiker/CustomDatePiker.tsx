import React, { useState } from 'react';
import './CustomDatePiker.css';

interface CustomDatePickerProps {
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  allowPast?: boolean;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ onClose, onDateSelect, allowPast }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (month: number, year: number) => {
    const result: (number | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let d = 1; d <= totalDays; d++) result.push(d);

    return result;
  };

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDateClick = (day: number | null) => {
    if (day) {
      const date = new Date(currentYear, currentMonth, day);
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  const days = getDaysInMonth(currentMonth, currentYear);

  // Tạo danh sách năm để chọn (ví dụ: từ currentYear - 50 đến currentYear + 10)
  const yearList = Array.from({ length: 61 }, (_, i) => currentYear - 50 + i);

  return (
    <div className="date-picker-modal">
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={handlePrev} className="nav-btn">❮</button>
          <span
            className="month-label"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowYearPicker(true)}
          >
            Tháng {currentMonth + 1} - {currentYear}
          </span>
          <button onClick={handleNext} className="nav-btn">❯</button>
        </div>

        {showYearPicker && (
          <div className="year-picker-modal">
            {yearList.map((year) => (
              <div
                key={year}
                className={`year-option${year === currentYear ? ' selected' : ''}`}
                onClick={() => {
                  setCurrentYear(year);
                  setShowYearPicker(false);
                }}
              >
                {year}
              </div>
            ))}
          </div>
        )}

        <div className="calendar-grid calendar-header-row">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="day-header">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((day, idx) => {
            // Kiểm tra ngày đã qua
            const isPast =
              day !== null &&
              new Date(currentYear, currentMonth, day) < today &&
              !allowPast;

            const isSelected =
              selectedDate &&
              day !== null &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth &&
              selectedDate.getFullYear() === currentYear;

            return (
              <div
                key={idx}
                className={`day-cell${isSelected ? ' selected' : ''}${isPast ? ' past-day' : ''}`}
                onClick={() => !isPast && handleDateClick(day)}
                style={isPast ? { pointerEvents: 'none' } : {}}
              >
                {day ?? ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomDatePicker;