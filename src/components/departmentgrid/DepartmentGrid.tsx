import React, { useState } from 'react';
import { useDispatch } from '../../utils/redux/hooks';
import './DepartmentGrid.css';
interface Department {
  patientData: { key: string; value: string }[];
}

interface DepartmentGridProps {
  departments: Department[];
  getDepartmentIcon: (iconKey: string) => string;
  selectedId?: string | number | null;
  onSelect?: (id: string | number) => void;
  onDetail?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}


const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  departments,
  getDepartmentIcon,
  selectedId,
  onSelect,
  onDetail,
  onDelete,
}) => (


  <div className="departments-grid">
    {departments.map((item, idx) => {
      // Lấy id, iconKey, tên khoa
      const id = item.patientData.find((f: any) => f.key === 'Mã khoa')?.value;
      if (!id) return null;
      let iconKey = item.patientData.find((f: any) => f.key === "icon")?.value || "";
      iconKey = iconKey.replace(/\.png$/i, '');
      const tenKhoa = item.patientData.find((f: any) => f.key === "Tên khoa")?.value || "";
      const icon = getDepartmentIcon(iconKey);
      const isSelected = String(selectedId) === String(id);
      return (
        <div
          key={id}
          className={`department-card${isSelected ? ' selected' : ''}`}
          onClick={() => onSelect && onSelect(id)}
          onTouchEnd={() => onSelect && onSelect(id)}
        >
          <div className="department-icon">
            <img src={icon} alt={tenKhoa} />
          </div>
          <div className="department-name">{tenKhoa}</div>
        </div>
      );
    })}
  </div>
);

export default DepartmentGrid;