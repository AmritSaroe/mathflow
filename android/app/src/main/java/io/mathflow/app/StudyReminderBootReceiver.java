package io.mathflow.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class StudyReminderBootReceiver extends BroadcastReceiver {
    private static final String TAG = "MathFlowReminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "boot recovery start action=" + (intent == null ? "" : intent.getAction()));
        StudyReminderScheduler.restoreEntries(context);
        Log.i(TAG, "boot recovery resolved");
    }
}
