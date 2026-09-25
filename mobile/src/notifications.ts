import { Platform } from "react-native";
import Constants from "expo-constants";
import { parseTime } from "./model";

async function nativeNotifications() {
  if (Platform.OS === "web")
    throw new Error(
      "Open the app on your iPhone or Android phone to enable phone reminders.",
    );
  return import("expo-notifications");
}
async function permission() {
  const n = await nativeNotifications();
  if (Platform.OS === "android")
    await n.setNotificationChannelAsync("care-reminders", {
      name: "Care reminders",
      importance: n.AndroidImportance.DEFAULT,
    });
  let result = await n.getPermissionsAsync();
  if (!result.granted) result = await n.requestPermissionsAsync();
  if (
    !result.granted &&
    result.ios?.status !== n.IosAuthorizationStatus.PROVISIONAL
  )
    throw new Error(
      "Notifications are off. Allow notifications in your phone settings, then try again.",
    );
  n.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  return n;
}
export async function enableReminders(time: string) {
  const { hour, minute } = parseTime(time);
  const n = await permission();
  const old = await n.getAllScheduledNotificationsAsync();
  const identifier = await n.scheduleNotificationAsync({
    content: {
      title: "A little time for your care",
      body: "Review your medication plan and today’s check-in in aftercare.",
      sound: "default",
      data: { screen: "Medication", type: "care-reminder" },
    },
    trigger: {
      type: n.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "care-reminders",
    },
  });
  await Promise.all(
    old
      .filter(
        (x) =>
          x.content.data?.type === "care-reminder" &&
          x.identifier !== identifier,
      )
      .map((x) => n.cancelScheduledNotificationAsync(x.identifier)),
  );
}
export async function disableReminders() {
  if (Platform.OS === "web") return;
  const n = await nativeNotifications();
  const scheduled = await n.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((x) => x.content.data?.type === "care-reminder")
      .map((x) => n.cancelScheduledNotificationAsync(x.identifier)),
  );
}
export async function testReminder() {
  const n = await permission();
  await n.scheduleNotificationAsync({
    content: {
      title: "Your care, one step at a time",
      body: "This is your aftercare demo reminder. Open your care plan when you’re ready.",
      data: { screen: "Medication" },
    },
    trigger: {
      type: n.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: "care-reminders",
    },
  });
}
export async function getPushToken() {
  if (Constants.appOwnership === "expo")
    throw new Error(
      "Remote push needs an installed development or preview build. Daily local reminders work separately.",
    );
  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId)
    throw new Error(
      "Link an Expo EAS project before registering for remote push. See the mobile README.",
    );
  const n = await permission();
  return (await n.getExpoPushTokenAsync({ projectId })).data;
}
export async function observeNotifications(onMedication: () => void) {
  if (Platform.OS === "web") return () => {};
  const n = await nativeNotifications();
  n.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  const open = (
    response: import("expo-notifications").NotificationResponse,
  ) => {
    if (response.notification.request.content.data?.screen === "Medication")
      onMedication();
  };
  const last = await n.getLastNotificationResponseAsync();
  if (last) open(last);
  const sub = n.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
