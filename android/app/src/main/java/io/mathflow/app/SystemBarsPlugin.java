package io.mathflow.app;

import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemBars")
public class SystemBarsPlugin extends Plugin {
    @PluginMethod
    public void set(PluginCall call) {
        String color = call.getString("color", "#FFFBFE");
        boolean darkIcons = call.getBoolean("darkIcons", true);
        try {
            if (getActivity() == null) {
                call.reject("Activity is not ready for system-bar styling.");
                return;
            }
            int parsedColor = Color.parseColor(color);
            Window window = getActivity().getWindow();
            window.setStatusBarColor(parsedColor);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                window.setNavigationBarColor(parsedColor);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) window.setNavigationBarDividerColor(parsedColor);
            }
            int flags = window.getDecorView().getSystemUiVisibility();
            if (darkIcons) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            window.getDecorView().setSystemUiVisibility(flags);
            call.resolve();
        } catch (Exception error) {
            // System-bar styling is cosmetic; do not let it crash the activity.
            call.reject("System-bar styling failed.", error);
        }
    }
}
