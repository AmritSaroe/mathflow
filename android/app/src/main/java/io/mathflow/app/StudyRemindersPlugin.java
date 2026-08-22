package io.mathflow.app;

import android.Manifest;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;

@CapacitorPlugin(
    name = "StudyReminders",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class StudyRemindersPlugin extends Plugin {
    private static final String TAG = "MathFlowReminders";

    @PluginMethod
    public void permissionStatus(PluginCall call) {
        Log.i(TAG, "permissionStatus start");
        boolean granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
            || getContext().checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        NotificationManager manager = (NotificationManager) getContext().getSystemService(NotificationManager.class);
        if (manager != null && !manager.areNotificationsEnabled()) granted = false;
        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
        Log.i(TAG, "permissionStatus resolved granted=" + granted);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Log.i(TAG, "requestPermission start");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || getContext().checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            call.resolve(permissionResult());
        } else {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
        }
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        Log.i(TAG, "notificationPermissionCallback");
        call.resolve(permissionResult());
    }

    private JSObject permissionResult() {
        boolean granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
            || getContext().checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        NotificationManager manager = (NotificationManager) getContext().getSystemService(NotificationManager.class);
        if (manager != null && !manager.areNotificationsEnabled()) granted = false;
        JSObject result = new JSObject();
        result.put("granted", granted);
        return result;
    }

    @PluginMethod
    public void status(PluginCall call) {
        Log.i(TAG, "status start");
        JSObject result = new JSObject();
        result.put("nativeReady", true);
        result.put("scheduler", "AlarmManager");
        result.put("exactAlarmUsed", false);
        result.put("sdk", Build.VERSION.SDK_INT);
        call.resolve(result);
        Log.i(TAG, "status resolved");
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        Log.i(TAG, "schedule start");
        JSONArray entries = call.getArray("entries");
        if (entries == null) {
            call.reject("Reminder entries are missing.");
            Log.e(TAG, "schedule failed: entries missing");
            return;
        }
        try {
            StudyReminderScheduler.scheduleEntries(getContext(), entries);
            JSObject result = new JSObject();
            result.put("scheduledEntries", StudyReminderScheduler.storedEntries(getContext()).length());
            result.put("exactAlarmUsed", false);
            call.resolve(result);
            Log.i(TAG, "schedule resolved entries=" + StudyReminderScheduler.storedEntries(getContext()).length());
        } catch (Exception error) {
            Log.e(TAG, "schedule failed", error);
            call.reject("Native reminder scheduling failed.", error);
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        Log.i(TAG, "clear start");
        try {
            StudyReminderScheduler.clear(getContext());
            call.resolve();
            Log.i(TAG, "clear resolved");
        } catch (Exception error) {
            Log.e(TAG, "clear failed", error);
            call.reject("Native reminder clearing failed.", error);
        }
    }

    @PluginMethod
    public void scheduleTest(PluginCall call) {
        Log.i(TAG, "scheduleTest start");
        Double atValue = call.getDouble("atMs");
        Integer idValue = call.getInt("id");
        if (atValue == null || idValue == null) {
            call.reject("Test reminder time or ID is missing.");
            Log.e(TAG, "scheduleTest failed: arguments missing");
            return;
        }
        try {
            StudyReminderScheduler.scheduleTest(getContext(), idValue, atValue.longValue());
            JSObject result = new JSObject();
            result.put("scheduled", true);
            result.put("exactAlarmUsed", false);
            call.resolve(result);
            Log.i(TAG, "scheduleTest resolved");
        } catch (Exception error) {
            Log.e(TAG, "scheduleTest failed", error);
            call.reject("Native test reminder scheduling failed.", error);
        }
    }

    @PluginMethod
    public void markPracticeCompleted(PluginCall call) {
        Log.i(TAG, "markPracticeCompleted start");
        String dateKey = call.getString("dateKey");
        if (dateKey == null || dateKey.isEmpty()) {
            call.reject("Practice date is missing.");
            Log.e(TAG, "markPracticeCompleted failed: date missing");
            return;
        }
        try {
            StudyReminderScheduler.markPracticeCompleted(getContext(), dateKey);
            call.resolve();
            Log.i(TAG, "markPracticeCompleted resolved date=" + dateKey);
        } catch (Exception error) {
            Log.e(TAG, "markPracticeCompleted failed", error);
            call.reject("Native practice completion cancellation failed.", error);
        }
    }
}
