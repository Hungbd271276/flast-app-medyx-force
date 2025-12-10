
import React from 'react';
import './DoctorGrid.css';

interface DoctorGridProps {
  id: string;
  name: string;
  speciality: string;
  experience: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const DoctorGrid: React.FC<DoctorGridProps> = ({ id, name, speciality, experience, selected, onSelect }) => {
  return (
    <div className={`doctor-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(id)}>
      <div className="doctor-avatar-grid">
        {/* <img src="/default-avatar.svg" alt="avatar" /> */}
      </div>
      <div className="doctor-info-grid">
        <strong>Bác sĩ {name}</strong>
        <p>Chuyên khoa: {speciality}</p>
        <p>Chức vụ: {experience}</p>
      </div>
    </div>
  );
};

export default DoctorGrid;
