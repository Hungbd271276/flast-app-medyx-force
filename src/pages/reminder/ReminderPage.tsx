import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonModal,
    IonInput,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonCheckbox,
    IonButtons,
    IonBackButton,
    IonFab,
    IonFabButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonBadge,
    IonAlert,
    IonToast,
    IonAccordion,
    IonAccordionGroup,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
} from '@ionic/react';
import {
    add,
    time,
    calendar,
    medical,
    notifications,
    pencil,
    trash,
    checkmark,
    close,
    alarm,
    today
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import CustomDatePicker from '../../components/datepiker/CustomDatePiker';
import { Storage } from '@capacitor/storage';
import { initNotifications, scheduleReminder, cancelReminder, testInstantNotification } from '../../utils/functions/notification';
import './ReminderPage.css';

interface Medicine {
    id: string;
    name: string;
    dosage: string;
    unit: string;
    instructions?: string;
}

interface MedicineReminder {
    id: string;
    title: string;
    medicines: Medicine[];
    times: string[]; 
    startDate: string;
    endDate: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    weekDays?: number[]; // For weekly frequency [0,1,2,3,4,5,6]
    isActive: boolean;
    notes?: string;
    createdAt: string;
    lastTaken?: string;
}

const ReminderPage: React.FC = () => {
    const { t } = useTranslation();
    const [reminders, setReminders] = useState<MedicineReminder[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState<MedicineReminder | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        medicines: [{ id: Date.now().toString(), name: '', dosage: '', unit: 'viên', instructions: '' }] as Medicine[],
        times: [new Date().toTimeString().slice(0, 5)], // Thay đổi từ ['08:00'] thành thời gian hiện tại
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
        weekDays: [1, 2, 3, 4, 5, 6, 0],
        notes: ''
    });

    const units = ['viên', 'gói', 'ml', 'mg', 'g', 'giọt', 'thìa', 'ống'];

    useEffect(() => {
        loadReminders();
        // Khởi tạo notifications khi component mount
        initNotifications().then(success => {
            console.log('🔔 Notification init result:', success);
            if (success) {
                showToastMessage('Thông báo đã được khởi tạo');
            } 
            // else {
            //     showToastMessage('Lỗi khởi tạo thông báo');
            // }
        });
    }, []);

    // Thêm function test
    // const handleTestNotification = async () => {
    //     console.log('🧪 Testing notification...');
    //     const result = await testInstantNotification();
    //     if (result) {
    //         showToastMessage('Thông báo test được tạo - kiểm tra sau 3 giây');
    //     } else {
    //         showToastMessage('Lỗi tạo thông báo test');
    //     }
    // };

    const loadReminders = async () => {
        try {
            const result = await Storage.get({ key: 'medicine_reminders' });
            if (result.value) {
                setReminders(JSON.parse(result.value));
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    };

    const scheduleAllNotifications = async (reminders: MedicineReminder[]) => {
        try {
            // Hủy tất cả thông báo cũ trước
            for (const reminder of reminders) {
                await cancelReminder(reminder.id);
            }
            
            // Lên lịch thông báo mới cho các reminder đang active
            for (const reminder of reminders) {
                if (reminder.isActive && reminder.frequency !== 'monthly') {
                    await scheduleReminder({
                        id: reminder.id,
                        title: reminder.title,
                        times: reminder.times,
                        startDate: reminder.startDate,
                        endDate: reminder.endDate,
                        frequency: reminder.frequency as 'daily' | 'weekly',
                        weekDays: reminder.weekDays
                    });
                }
            }
        } catch (error) {
            console.error('Error scheduling notifications:', error);
        }
    };

    const saveReminders = async (newReminders: MedicineReminder[]) => {
        try {
            await Storage.set({
                key: 'medicine_reminders',
                value: JSON.stringify(newReminders)
            });
            setReminders(newReminders);
            
            // Lên lịch thông báo cho tất cả reminder đang active
            await scheduleAllNotifications(newReminders);
        } catch (error) {
            console.error('Error saving reminders:', error);
            showToastMessage('Lỗi khi lưu thông báo');
        }
    };

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            medicines: [{ id: Date.now().toString(), name: '', dosage: '', unit: 'viên', instructions: '' }],
            times: [new Date().toTimeString().slice(0, 5)], // Thay đổi từ ['08:00'] thành thời gian hiện tại
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            frequency: 'daily',
            weekDays: [1, 2, 3, 4, 5, 6, 0],
            notes: ''
        });
    };

    const addMedicine = () => {
        setFormData(prev => ({
            ...prev,
            medicines: [...prev.medicines, {
                id: Date.now().toString(),
                name: '',
                dosage: '',
                unit: 'viên',
                instructions: ''
            }]
        }));
    };

    const removeMedicine = (id: string) => {
        setFormData(prev => ({
            ...prev,
            medicines: prev.medicines.filter(med => med.id !== id)
        }));
    };

    const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
        setFormData(prev => ({
            ...prev,
            medicines: prev.medicines.map(med =>
                med.id === id ? { ...med, [field]: value } : med
            )
        }));
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            times: [...prev.times, new Date().toTimeString().slice(0, 5)] // Thay đổi từ '12:00' thành thời gian hiện tại
        }));
    };

    const removeTime = (index: number) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index)
        }));
    };

    const updateTime = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.map((time, i) => i === index ? value : time)
        }));
    };

    const handleSaveReminder = async () => {
        if (!formData.title.trim()) {
            showToastMessage('Vui lòng nhập tên lịch nhắc');
            return;
        }

        if (formData.medicines.some(med => !med.name.trim() || !med.dosage.trim())) {
            showToastMessage('Vui lòng điền đầy đủ thông tin thuốc');
            return;
        }

        const newReminder: MedicineReminder = {
            id: selectedReminder?.id || Date.now().toString(),
            title: formData.title,
            medicines: formData.medicines,
            times: formData.times,
            startDate: formData.startDate,
            endDate: formData.endDate,
            frequency: formData.frequency,
            weekDays: formData.weekDays,
            isActive: true,
            notes: formData.notes,
            createdAt: selectedReminder?.createdAt || new Date().toISOString()
        };

        let updatedReminders;
        if (selectedReminder) {
            updatedReminders = reminders.map(r => r.id === selectedReminder.id ? newReminder : r);
            showToastMessage('Cập nhật lịch nhắc thành công');
        } else {
            updatedReminders = [...reminders, newReminder];
            showToastMessage('Thêm lịch nhắc thành công');
        }

        await saveReminders(updatedReminders);
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedReminder(null);
        resetForm();
    };

    const handleEditReminder = (reminder: MedicineReminder) => {
        setSelectedReminder(reminder);
        setFormData({
            title: reminder.title,
            medicines: reminder.medicines,
            times: reminder.times,
            startDate: reminder.startDate,
            endDate: reminder.endDate,
            frequency: reminder.frequency,
            weekDays: reminder.weekDays || [1, 2, 3, 4, 5, 6, 0],
            notes: reminder.notes || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteReminder = async () => {
        if (reminderToDelete) {
            // Hủy thông báo cho reminder này trước khi xóa
            await cancelReminder(reminderToDelete);
            
            const updatedReminders = reminders.filter(r => r.id !== reminderToDelete);
            await saveReminders(updatedReminders);
            showToastMessage('Xóa lịch nhắc thành công');
            setShowDeleteAlert(false);
            setReminderToDelete(null);
        }
    };

    const toggleReminderActive = async (id: string) => {
        const updatedReminders = reminders.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        );
        await saveReminders(updatedReminders);
        showToastMessage('Cập nhật trạng thái thành công');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    const getWeekDayNames = (weekDays: number[]) => {
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return weekDays.sort().map(day => dayNames[day]).join(', ');
    };

    const renderReminderModal = (isEdit: boolean = false) => (
        <IonModal isOpen={isEdit ? showEditModal : showAddModal} onDidDismiss={() => {
            if (isEdit) {
                setShowEditModal(false);
                setSelectedReminder(null);
            } else {
                setShowAddModal(false);
            }
            resetForm();
        }}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{isEdit ? 'Sửa lịch nhắc' : 'Thêm lịch nhắc'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => {
                            if (isEdit) {
                                setShowEditModal(false);
                                setSelectedReminder(null);
                            } else {
                                setShowAddModal(false);
                            }
                            resetForm();
                        }}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="reminder-modal-content">
                <div className="form-container">
                    {/* Tên lịch nhắc */}
                    <IonItem>
                        <IonLabel position="stacked">Tên lịch nhắc *</IonLabel>
                        <IonInput
                            value={formData.title}
                            onIonInput={(e) => setFormData(prev => ({ ...prev, title: e.detail.value! }))}
                            placeholder="Ví dụ: Uống thuốc sáng"
                        />
                    </IonItem>

                    {/* Danh sách thuốc */}
                    <div className="medicines-section">
                        <div className="section-header">
                            <h3>Danh sách thuốc</h3>
                            <IonButton fill="clear" onClick={addMedicine}>
                                <IonIcon icon={add} slot="start" />
                                Thêm thuốc
                            </IonButton>
                        </div>

                        {formData.medicines.map((medicine, index) => (
                            <IonCard key={medicine.id} className="medicine-card">
                                <IonCardContent>
                                    <div className="medicine-header">
                                        <h4>Thuốc {index + 1}</h4>
                                        {formData.medicines.length > 1 && (
                                            <IonButton
                                                fill="clear"
                                                color="danger"
                                                onClick={() => removeMedicine(medicine.id)}
                                            >
                                                <IonIcon icon={trash} />
                                            </IonButton>
                                        )}
                                    </div>

                                    <IonItem>
                                        <IonLabel position="stacked">Tên thuốc *</IonLabel>
                                        <IonInput
                                            value={medicine.name}
                                            onIonInput={(e) => updateMedicine(medicine.id, 'name', e.detail.value!)}
                                            placeholder="Ví dụ: Paracetamol"
                                        />
                                    </IonItem>

                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size="6">
                                                <IonItem>
                                                    <IonLabel position="stacked">Liều lượng *</IonLabel>
                                                    <IonInput
                                                        value={medicine.dosage}
                                                        onIonInput={(e) => updateMedicine(medicine.id, 'dosage', e.detail.value!)}
                                                        placeholder="Ví dụ: 1"
                                                        type="number"
                                                    />
                                                </IonItem>
                                            </IonCol>
                                            <IonCol size="6">
                                                <IonItem>
                                                    <IonLabel position="stacked">Đơn vị</IonLabel>
                                                    <IonSelect
                                                        value={medicine.unit}
                                                        onIonChange={(e) => updateMedicine(medicine.id, 'unit', e.detail.value)}
                                                    >
                                                        {units.map(unit => (
                                                            <IonSelectOption key={unit} value={unit}>{unit}</IonSelectOption>
                                                        ))}
                                                    </IonSelect>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>

                                    <IonItem>
                                        <IonLabel position="stacked">Hướng dẫn sử dụng</IonLabel>
                                        <IonTextarea
                                            value={medicine.instructions}
                                            onIonInput={(e) => updateMedicine(medicine.id, 'instructions', e.detail.value!)}
                                            placeholder="Ví dụ: Uống sau ăn"
                                            rows={2}
                                        />
                                    </IonItem>
                                </IonCardContent>
                            </IonCard>
                        ))}
                    </div>

                    {/* Thời gian uống */}
                    <div className="times-section">
                        <div className="section-header">
                            <h3>Thời gian uống</h3>
                            <IonButton fill="clear" onClick={addTime}>
                                <IonIcon icon={add} slot="start" />
                                Thêm giờ
                            </IonButton>
                        </div>

                        {formData.times.map((time, index) => (
                            <IonItem key={index}>
                                <IonLabel position="stacked">Giờ {index + 1}</IonLabel>
                                <IonInput
                                    type="time"
                                    value={time}
                                    onIonInput={(e) => updateTime(index, e.detail.value!)}
                                    // Thêm các thuộc tính này để hiển thị định dạng 24 giờ
                                    step="60"
                                    min="00:00"
                                    max="23:59"
                                />
                                {formData.times.length > 1 && (
                                    <IonButton
                                        fill="clear"
                                        color="danger"
                                        slot="end"
                                        onClick={() => removeTime(index)}
                                    >
                                        <IonIcon icon={trash} />
                                    </IonButton>
                                )}
                            </IonItem>
                        ))}
                    </div>

                    {/* Thời gian bắt đầu và kết thúc */}
                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <IonItem button onClick={() => setShowStartDatePicker(true)}>
                                    <IonLabel position="stacked">Ngày bắt đầu</IonLabel>
                                    <IonInput
                                        readonly
                                        value={formData.startDate ? new Date(formData.startDate).toLocaleDateString('vi-VN') : ''}
                                        placeholder="Chọn ngày bắt đầu"
                                    />
                                </IonItem>
                            </IonCol>
                            <IonCol size="6">
                                <IonItem button onClick={() => setShowEndDatePicker(true)}>
                                    <IonLabel position="stacked">Ngày kết thúc</IonLabel>
                                    <IonInput
                                        readonly
                                        value={formData.endDate ? new Date(formData.endDate).toLocaleDateString('vi-VN') : ''}
                                        placeholder="Chọn ngày kết thúc"
                                    />
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* CustomDatePicker cho ngày bắt đầu */}
                    {showStartDatePicker && (
                        <CustomDatePicker
                            onClose={() => setShowStartDatePicker(false)}
                            onDateSelect={(date) => {
                                const formattedDate = new Intl.DateTimeFormat('sv-SE').format(date); // YYYY-MM-DD
                                setFormData(prev => ({
                                    ...prev,
                                    startDate: new Date(formattedDate).toISOString()
                                }));
                                setShowStartDatePicker(false);
                            }}
                            allowPast={true}
                            initialDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                        />
                    )}

                    {/* CustomDatePicker cho ngày kết thúc */}
                    {showEndDatePicker && (
                        <CustomDatePicker
                            onClose={() => setShowEndDatePicker(false)}
                            onDateSelect={(date) => {
                                const formattedDate = new Intl.DateTimeFormat('sv-SE').format(date); // YYYY-MM-DD
                                setFormData(prev => ({
                                    ...prev,
                                    endDate: new Date(formattedDate).toISOString()
                                }));
                                setShowEndDatePicker(false);
                            }}
                            allowPast={true}
                            initialDate={formData.endDate ? new Date(formData.endDate) : new Date()}
                            minDate={formData.startDate ? new Date(formData.startDate) : new Date()} // Ngày kết thúc không được nhỏ hơn ngày bắt đầu
                        />
                    )}

                    {/* Tần suất */}
                    <IonItem>
                        <IonLabel position="stacked">Tần suất</IonLabel>
                        <IonSelect
                            value={formData.frequency}
                            onIonChange={(e) => setFormData(prev => ({ ...prev, frequency: e.detail.value }))}
                        >
                            <IonSelectOption value="daily">Hàng ngày</IonSelectOption>
                            <IonSelectOption value="weekly">Hàng tuần</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    {/* Ghi chú */}
                    <IonItem>
                        <IonLabel position="stacked">Ghi chú</IonLabel>
                        <IonTextarea
                            value={formData.notes}
                            onIonInput={(e) => setFormData(prev => ({ ...prev, notes: e.detail.value! }))}
                            placeholder="Ghi chú thêm..."
                            rows={3}
                        />
                    </IonItem>
                </div>

                <div className="modal-actions">
                    <IonButton
                        expand="block"
                        onClick={handleSaveReminder}
                        className="save-btn"
                    >
                        <IonIcon icon={checkmark} slot="start" />
                        {isEdit ? 'Cập nhật' : 'Lưu lịch nhắc'}
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );

    const renderReminderCard = (reminder: MedicineReminder) => (
        <IonItemSliding key={reminder.id}>
            <IonCard className={`reminder-card ${!reminder.isActive ? 'inactive' : ''}`}>
                <IonCardHeader>
                    <div className="reminder-card-header">
                        <IonCardTitle>{reminder.title}</IonCardTitle>
                        <div className="reminder-status">
                            <IonBadge color={reminder.isActive ? 'success' : 'medium'}>
                                {reminder.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </IonBadge>
                        </div>
                    </div>
                </IonCardHeader>

                <IonCardContent>
                    <div className="reminder-info">
                        <div className="medicines-info">
                            <h4><IonIcon icon={medical} /> Thuốc:</h4>
                            {reminder.medicines.map((medicine, index) => (
                                <div key={medicine.id} className="medicine-item">
                                    <span className="medicine-name">{medicine.name}</span>
                                    <span className="medicine-dosage">{medicine.dosage} {medicine.unit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="time-info">
                            <h4><IonIcon icon={time} /> Khung giờ:</h4>
                            <div className="times">
                                {reminder.times.map((time, index) => (
                                    <IonBadge key={index} color="primary" className="time-badge">
                                        {formatTime(time)}
                                    </IonBadge>
                                ))}
                            </div>
                        </div>

                        <div className="date-info">
                            <h4><IonIcon icon={calendar} /> Thời gian:</h4>
                            <div className="date-range">
                                {formatDate(reminder.startDate)} - {formatDate(reminder.endDate)}
                            </div>
                        </div>

                        {reminder.notes && (
                            <div className="notes-info">
                                <h4>Ghi chú:</h4>
                                <p>{reminder.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="reminder-actions">
                        <IonButton
                            fill="clear"
                            onClick={() => toggleReminderActive(reminder.id)}
                            color={reminder.isActive ? 'medium' : 'success'}
                        >
                            <IonIcon icon={reminder.isActive ? notifications : checkmark} slot="start" />
                            {reminder.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                        </IonButton>

                        <IonButton
                            fill="clear"
                            onClick={() => handleEditReminder(reminder)}
                        >
                            <IonIcon icon={pencil} slot="start" />
                            Sửa
                        </IonButton>

                        <IonButton
                            fill="clear"
                            color="danger"
                            onClick={() => {
                                setReminderToDelete(reminder.id);
                                setShowDeleteAlert(true);
                            }}
                        >
                            <IonIcon icon={trash} slot="start" />
                            Xóa
                        </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>

            <IonItemOptions side="end">
                <IonItemOption color="primary" onClick={() => handleEditReminder(reminder)}>
                    <IonIcon icon={pencil} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => {
                    setReminderToDelete(reminder.id);
                    setShowDeleteAlert(true);
                }}>
                    <IonIcon icon={trash} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );

    return (
        <IonPage>
            <IonHeader className='ion-home-header'>
                <IonToolbar className="tool-bar-header custom-toolbar">
                    <div className="toolbar-flex">
                        <div className="toolbar-side">
                            <IonButtons slot="start">
                                <IonBackButton defaultHref="/" />
                            </IonButtons>
                        </div>
                        <div className="toolbar-center">Lịch uống thuốc</div>
                        {/* <div className="toolbar-side"> <IonButton fill="clear" onClick={handleTestNotification}> 🧪 Test </IonButton> </div> */}
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent className="reminder-page-content">
                <div className="reminder-stats">
                    <IonCard className="stats-card">
                        <IonCardContent>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <IonIcon icon={alarm} classNammedicines-infoe="stat-icon" />
                                    <div className="stat-info">
                                        <div className="stat-number">{reminders.filter(r => r.isActive).length}</div>
                                        <div className="stat-label">Đang hoạt động</div>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <IonIcon icon={today} className="stat-icon" />
                                    <div className="stat-info">
                                        <div className="stat-number">{reminders.length}</div>
                                        <div className="stat-label">Tổng số lịch</div>
                                    </div>
                                </div>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </div>

                <div className="reminders-list">
                    {reminders.length === 0 ? (
                        <div className="empty-state">
                            <IonIcon icon={medical} className="empty-icon" />
                            <h3>Chưa có lịch nhắc nào</h3>
                            <p>Thêm lịch nhắc uống thuốc để không bỏ lỡ</p>
                            <IonButton onClick={() => setShowAddModal(true)}>
                                <IonIcon icon={add} slot="start" />
                                Thêm lịch nhắc đầu tiên
                            </IonButton>
                        </div>
                    ) : (
                        reminders.map(reminder => renderReminderCard(reminder))
                    )}
                </div>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => setShowAddModal(true)}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>

            {renderReminderModal(false)}
            {renderReminderModal(true)}

            <IonAlert
                isOpen={showDeleteAlert}
                onDidDismiss={() => setShowDeleteAlert(false)}
                header="Xác nhận xóa"
                className='alert-wrapper'
                message="Bạn có chắc chắn muốn xóa lịch nhắc này?"
                buttons={[
                    {
                        text: 'Hủy',
                        role: 'cancel',
                        handler: () => setShowDeleteAlert(false)
                    },
                    {
                        text: 'Xóa',
                        role: 'confirm',
                        handler: handleDeleteReminder
                    }
                ]}
            />

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
                position="top"
            />
        </IonPage>
    );
};

export default ReminderPage;