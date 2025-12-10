import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";

export const initNotifications = async () => {
  try {
    // Xin quyền thông báo
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    // Lắng nghe khi người dùng nhấn vào thông báo
    LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (notificationAction) => {
        console.log("Notification clicked:", notificationAction);
        // Có thể thêm logic mở app hoặc trang cụ thể
      }
    );

    console.log("Notifications initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
};

export const scheduleReminder = async (reminderData: {
  id: string;
  title: string;
  times: string[];
  startDate: string;
  endDate: string;
  frequency: "daily" | "weekly";
  weekDays?: number[];
}) => {
  try {
    const notifications = [];
    const startDate = new Date(reminderData.startDate);
    const endDate = new Date(reminderData.endDate);
    for (const timeStr of reminderData.times) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (reminderData.frequency === "daily") {
        let notificationId = 1;
        for (
          let currentDate = new Date(startDate);
          currentDate <= endDate && notificationId <= 64;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          const notificationTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            hours,
            minutes,
            0,
            0
          );
          if (notificationTime > new Date()) {
            notifications.push({
              title: "💊 Nhắc nhở uống thuốc",
              body: `Đã đến giờ uống thuốc: ${reminderData.title}`,
              id: Number(`${notificationId}${reminderData.id.slice(-3)}`),
              schedule: { at: notificationTime },
              sound: "default",
              actionTypeId: "medicine_reminder",
              extra: {
                reminderId: reminderData.id,
                time: timeStr,
              },
            });
            notificationId++;
          }
        }
      } else if (reminderData.frequency === "weekly" && reminderData.weekDays) {
        let notificationId = 1;
        for (
          let currentDate = new Date(startDate);
          currentDate <= endDate && notificationId <= 64;
          currentDate.setDate(currentDate.getDate() + 1)
        ) {
          if (reminderData.weekDays.includes(currentDate.getDay())) {
            const notificationTime = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              hours,
              minutes,
              0,
              0
            );
            if (notificationTime > new Date()) {
              notifications.push({
                title: "💊 Nhắc nhở uống thuốc",
                body: `Đã đến giờ uống thuốc: ${reminderData.title}`,
                id: parseInt(`${reminderData.id}${notificationId}`),
                schedule: { at: notificationTime },
                sound: "default",
                actionTypeId: "medicine_reminder",
                extra: {
                  reminderId: reminderData.id,
                  time: timeStr,
                },
              });
              notificationId++;
            }
          }
        }
      }
    }
    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: notifications,
      });
      console.log(
        `Scheduled ${notifications.length} notifications for reminder: ${reminderData.title}`
      );
    }
    return true;
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    return false;
  }
};

export const cancelReminder = async (reminderId: string) => {
  try {
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications.filter(
      (n) => n.extra?.reminderId === reminderId
    );

    if (toCancel.length > 0) {
      await LocalNotifications.cancel({
        notifications: toCancel.map((n) => ({ id: n.id })),
      });
      console.log(
        `Cancelled ${toCancel.length} notifications for reminder: ${reminderId}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error cancelling reminder:", error);
    return false;
  }
};

export const testInstantNotification = async () => {
  try {
    const notificationTime = new Date();
    notificationTime.setSeconds(notificationTime.getSeconds() + 3);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "💊 Nhắc nhở uống thuốc",
          body: "Đây là thông báo test - Đã đến giờ uống thuốc",
          id: 999999,
          schedule: { at: notificationTime },
          sound: "default",
          actionTypeId: "test_notification",
        },
      ],
    });

    console.log("Test notification scheduled for:", notificationTime);
    return true;
  } catch (error) {
    console.error("Error creating test notification:", error);
    return false;
  }
};
