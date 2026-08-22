package io.mathflow.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

final class StudyReminderScheduler {
    static final String PREFS = "mathflow-study-reminders-native";
    static final String ENTRIES_KEY = "entries";
    static final String PRACTICED_DATE_KEY = "practicedDate";
    static final int TEST_ID = 5299;
    static final int[] LEGACY_IDS = {5201, 5202, 5203, 5204, 5205, 5206, 5207};
    static final String ACTION_PRIMARY = "io.mathflow.app.STUDY_REMINDER_PRIMARY";
    static final String ACTION_FOLLOWUP = "io.mathflow.app.STUDY_REMINDER_FOLLOWUP";
    static final String ACTION_TEST = "io.mathflow.app.STUDY_REMINDER_TEST";

    private StudyReminderScheduler() {}

    static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static JSONArray storedEntries(Context context) {
        String raw = preferences(context).getString(ENTRIES_KEY, "[]");
        try {
            return new JSONArray(raw);
        } catch (JSONException ignored) {
            return new JSONArray();
        }
    }

    static void replaceEntries(Context context, JSONArray entries) {
        preferences(context).edit().putString(ENTRIES_KEY, entries.toString()).apply();
    }

    static String practicedDate(Context context) {
        return preferences(context).getString(PRACTICED_DATE_KEY, "");
    }

    static boolean practicedOn(Context context, String dateKey) {
        return dateKey != null && dateKey.equals(practicedDate(context));
    }

    static void cancelId(Context context, int id) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            PendingIntent pendingIntent = pendingIntent(context, id, ACTION_PRIMARY, 0L, "", "");
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            PendingIntent followup = pendingIntent(context, id, ACTION_FOLLOWUP, 0L, "", "");
            alarmManager.cancel(followup);
            followup.cancel();
            PendingIntent test = pendingIntent(context, id, ACTION_TEST, 0L, "", "");
            alarmManager.cancel(test);
            test.cancel();
        }
    }

    static void clear(Context context) {
        JSONArray entries = storedEntries(context);
        for (int index = 0; index < entries.length(); index += 1) {
            JSONObject entry = entries.optJSONObject(index);
            if (entry == null) continue;
            cancelId(context, entry.optInt("primaryId", -1));
            cancelId(context, entry.optInt("followupId", -1));
        }
        cancelId(context, TEST_ID);
        for (int legacyId : LEGACY_IDS) cancelId(context, legacyId);
        replaceEntries(context, new JSONArray());
    }

    static void scheduleEntries(Context context, JSONArray entries) throws JSONException {
        clear(context);
        JSONArray persisted = new JSONArray();
        long now = System.currentTimeMillis();
        for (int index = 0; index < entries.length(); index += 1) {
            JSONObject entry = entries.getJSONObject(index);
            long primaryAt = entry.optLong("primaryAtMs", 0L);
            int primaryId = entry.optInt("primaryId", -1);
            if (primaryAt <= now || primaryId < 0) continue;
            if (practicedOn(context, entry.optString("dateKey", ""))) continue;
            scheduleAlarm(context, primaryId, primaryAt, ACTION_PRIMARY, entry);
            persisted.put(entry);
        }
        replaceEntries(context, persisted);
    }

    static void restoreEntries(Context context) {
        JSONArray entries = storedEntries(context);
        long now = System.currentTimeMillis();
        for (int index = 0; index < entries.length(); index += 1) {
            JSONObject entry = entries.optJSONObject(index);
            if (entry == null) continue;
            String dateKey = entry.optString("dateKey", "");
            long primaryAt = entry.optLong("primaryAtMs", 0L);
            int primaryId = entry.optInt("primaryId", -1);
            if (primaryAt > now && primaryId >= 0 && !practicedOn(context, dateKey)) {
                scheduleAlarm(context, primaryId, primaryAt, ACTION_PRIMARY, entry);
            }
        }
    }

    static void markPracticeCompleted(Context context, String dateKey) {
        preferences(context).edit().putString(PRACTICED_DATE_KEY, dateKey == null ? "" : dateKey).apply();
        JSONArray entries = storedEntries(context);
        JSONArray remaining = new JSONArray();
        for (int index = 0; index < entries.length(); index += 1) {
            JSONObject entry = entries.optJSONObject(index);
            if (entry == null) continue;
            if (dateKey != null && dateKey.equals(entry.optString("dateKey", ""))) {
                cancelId(context, entry.optInt("primaryId", -1));
                cancelId(context, entry.optInt("followupId", -1));
            } else {
                remaining.put(entry);
            }
        }
        replaceEntries(context, remaining);
    }

    static void scheduleFollowup(Context context, int id, long atMs, String dateKey, String slotId) {
        if (id < 0 || atMs <= System.currentTimeMillis()) return;
        JSONObject entry = new JSONObject();
        try {
            entry.put("dateKey", dateKey == null ? "" : dateKey);
            entry.put("slotId", slotId == null ? "" : slotId);
        } catch (JSONException ignored) {}
        scheduleAlarm(context, id, atMs, ACTION_FOLLOWUP, entry);
    }

    static void scheduleTest(Context context, int id, long atMs) {
        JSONObject entry = new JSONObject();
        try {
            entry.put("test", true);
        } catch (JSONException ignored) {}
        cancelId(context, id);
        scheduleAlarm(context, id, atMs, ACTION_TEST, entry);
    }

    static void scheduleAlarm(Context context, int id, long atMs, String action, JSONObject entry) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null || id < 0 || atMs <= System.currentTimeMillis()) return;
        PendingIntent pendingIntent = pendingIntent(
            context,
            id,
            action,
            entry.optLong("followupAtMs", 0L),
            entry.optString("dateKey", ""),
            entry.optString("slotId", "")
        );
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, atMs, pendingIntent);
        } else {
            alarmManager.set(AlarmManager.RTC_WAKEUP, atMs, pendingIntent);
        }
    }

    private static PendingIntent pendingIntent(Context context, int id, String action, long followupAtMs, String dateKey, String slotId) {
        Intent intent = new Intent(context, StudyReminderReceiver.class);
        intent.setAction(action);
        intent.putExtra("id", id);
        intent.putExtra("followupAtMs", followupAtMs);
        intent.putExtra("dateKey", dateKey);
        intent.putExtra("slotId", slotId);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(context, id, intent, flags);
    }
}
