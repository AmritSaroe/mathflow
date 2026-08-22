package io.mathflow.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

public class StudyReminderReceiver extends BroadcastReceiver {
    private static final String TAG = "MathFlowReminders";
    private static final String CHANNEL_ID = "mathflow-reminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? "" : intent.getAction();
        int id = intent == null ? -1 : intent.getIntExtra("id", -1);
        String dateKey = intent == null ? "" : intent.getStringExtra("dateKey");
        Log.i(TAG, "delivery start action=" + action + " id=" + id + " date=" + dateKey);

        if (StudyReminderScheduler.ACTION_PRIMARY.equals(action)) {
            if (StudyReminderScheduler.practicedOn(context, dateKey)) {
                Log.i(TAG, "primary suppressed because practice is complete for the day");
                StudyReminderScheduler.cancelId(context, id);
                return;
            }
            postNotification(context, id, "MathFlow practice time", "A quick maths drill is waiting for you.");
            armOneFollowup(context, id, dateKey, intent.getStringExtra("slotId"), intent.getLongExtra("followupAtMs", 0L));
            return;
        }

        if (StudyReminderScheduler.ACTION_FOLLOWUP.equals(action)) {
            if (StudyReminderScheduler.practicedOn(context, dateKey)) {
                Log.i(TAG, "follow-up suppressed because practice is complete for the day");
                StudyReminderScheduler.cancelId(context, id);
                return;
            }
            postNotification(context, id, "MathFlow follow-up", "Still have a minute for one quick maths drill?");
            return;
        }

        if (StudyReminderScheduler.ACTION_TEST.equals(action)) {
            postNotification(context, id, "MathFlow test reminder", "Your practice reminder is working. Ready for one quick drill?");
            return;
        }

        Log.w(TAG, "unknown reminder action");
    }

    private void armOneFollowup(Context context, int primaryId, String dateKey, String slotId, long atMs) {
        if (atMs <= System.currentTimeMillis()) {
            Log.i(TAG, "follow-up skipped because its time has passed");
            return;
        }
        int followupId = -1;
        JSONArray entries = StudyReminderScheduler.storedEntries(context);
        for (int index = 0; index < entries.length(); index += 1) {
            JSONObject entry = entries.optJSONObject(index);
            if (entry != null && entry.optInt("primaryId", -1) == primaryId) {
                followupId = entry.optInt("followupId", -1);
                break;
            }
        }
        if (followupId < 0) {
            Log.w(TAG, "follow-up skipped because no matching slot entry was found");
            return;
        }
        StudyReminderScheduler.scheduleFollowup(context, followupId, atMs, dateKey, slotId);
        Log.i(TAG, "one follow-up armed id=" + followupId + " at=" + atMs);
    }

    private void postNotification(Context context, int id, String title, String body) {
        ensureChannel(context);
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent contentIntent = null;
        if (launchIntent != null) {
            launchIntent.putExtra("route", "practice");
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            contentIntent = PendingIntent.getActivity(context, id, launchIntent, flags);
        }

        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(context, CHANNEL_ID)
            : new Notification.Builder(context);
        builder.setSmallIcon(R.drawable.ic_stat_mathflow)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setCategory(Notification.CATEGORY_REMINDER)
            .setPriority(Notification.PRIORITY_DEFAULT);
        if (contentIntent != null) builder.setContentIntent(contentIntent);

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.notify(id, builder.build());
        Log.i(TAG, "notification posted id=" + id);
    }

    private void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Study reminders", NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription("MathFlow practice reminders");
            manager.createNotificationChannel(channel);
        }
    }
}
