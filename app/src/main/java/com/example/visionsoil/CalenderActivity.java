package com.example.visionsoil;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.GridView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

public class CalenderActivity extends AppCompatActivity {
    private GridView calendarGrid;
    private TextView monthTextView;
    private Calendar currentCalendar = Calendar.getInstance();
    private HashSet<Integer> selectedDays = new HashSet<>();
    private List<String> days = new ArrayList<>();
    private static final int SMS_PERMISSION_REQUEST_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_calender);

        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.SEND_SMS}, SMS_PERMISSION_REQUEST_CODE);
        }


        calendarGrid = findViewById(R.id.calendarGrid);
        monthTextView = findViewById(R.id.monthTextView);
        Button prevButton = findViewById(R.id.prevButton);
        Button nextButton = findViewById(R.id.nextButton);

        loadSelectedDays(); // Load previously saved selected days
        updateCalendar();

        prevButton.setOnClickListener(v -> {
            currentCalendar.add(Calendar.MONTH, -1);
            loadSelectedDays(); // Load saved days for new month
            updateCalendar();
        });

        nextButton.setOnClickListener(v -> {
            currentCalendar.add(Calendar.MONTH, 1);
            loadSelectedDays();
            updateCalendar();
        });

        calendarGrid.setOnItemClickListener((parent, view, position, id) -> {
            String dayStr = days.get(position);
            if (!dayStr.isEmpty()) {
                int day = Integer.parseInt(dayStr);

                // Toggle selection of the day
                if (selectedDays.contains(day)) {
                    selectedDays.remove(day);
                } else {
                    selectedDays.add(day);
                }

                saveSelectedDays();  // Save the selected days after change
                ((BaseAdapter) calendarGrid.getAdapter()).notifyDataSetChanged();

                // Get current date (month and year)
                SimpleDateFormat sdf = new SimpleDateFormat("MMMM yyyy", Locale.getDefault());
                String formattedDate = sdf.format(currentCalendar.getTime());

                // Create the SMS message with day, date, and emoji
                String message = "✅ Day " + dayStr + " irrigation done!\n" + "📅 " + formattedDate + "\n" + "🌱 Plants watered! 🌿";


                // Send the SMS with the selected day and details
                sendSuccessSms("+21621843815", message);
                System.out.println(message);// Replace with the actual phone number
            }
        });

    }

    private void updateCalendar() {
        populateCalendar();
        updateMonthTextView();
        calendarGrid.setAdapter(new CalendarAdapter());
    }

    private void populateCalendar() {
        days.clear();
        Calendar calendar = (Calendar) currentCalendar.clone();
        calendar.set(Calendar.DAY_OF_MONTH, 1);

        int firstDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        int emptyCells = (firstDayOfWeek - 1) % 7;

        // Add empty cells
        for (int i = 0; i < emptyCells; i++) {
            days.add("");
        }

        // Add days of month
        for (int i = 1; i <= daysInMonth; i++) {
            days.add(String.valueOf(i));
        }

        // Fill remaining cells to make 6 weeks
        int totalCells = 42; // 6 weeks * 7 days
        while (days.size() < totalCells) {
            days.add("");
        }
    }

    private void updateMonthTextView() {
        SimpleDateFormat sdf = new SimpleDateFormat("MMMM yyyy", Locale.getDefault());
        monthTextView.setText(sdf.format(currentCalendar.getTime()));
    }

    // Save selected days to SharedPreferences
    private void saveSelectedDays() {
        getSharedPreferences("CalendarPrefs", MODE_PRIVATE)
                .edit()
                .putStringSet("selectedDays_" + getMonthYearKey(), convertSetToStringSet(selectedDays))
                .apply();
    }

    // Load selected days from SharedPreferences
    private void loadSelectedDays() {
        selectedDays.clear();
        selectedDays.addAll(convertStringSetToIntSet(
                (HashSet<String>) getSharedPreferences("CalendarPrefs", MODE_PRIVATE)
                        .getStringSet("selectedDays_" + getMonthYearKey(), new HashSet<>())
        ));
    }

    // Convert Integer Set to String Set for SharedPreferences
    private HashSet<String> convertSetToStringSet(HashSet<Integer> set) {
        HashSet<String> stringSet = new HashSet<>();
        for (Integer num : set) {
            stringSet.add(String.valueOf(num));
        }
        return stringSet;
    }

    // Convert String Set to Integer Set after retrieving from SharedPreferences
    private HashSet<Integer> convertStringSetToIntSet(HashSet<String> stringSet) {
        HashSet<Integer> intSet = new HashSet<>();
        for (String str : stringSet) {
            intSet.add(Integer.parseInt(str));
        }
        return intSet;
    }

    // Create a unique key for each month and year
    private String getMonthYearKey() {
        SimpleDateFormat sdf = new SimpleDateFormat("MM-yyyy", Locale.getDefault());
        return sdf.format(currentCalendar.getTime());
    }
    private void sendSuccessSms(String phoneNumber, String message) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            Toast.makeText(this, "SMS Sent to " + phoneNumber, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Log.e("SMS_ERROR", "Failed to send SMS: " + e.getMessage());
            Toast.makeText(this, "Failed to send SMS", Toast.LENGTH_SHORT).show();
        }
    }

    private class CalendarAdapter extends BaseAdapter {
        @Override
        public int getCount() { return days.size(); }

        @Override
        public String getItem(int position) { return days.get(position); }

        @Override
        public long getItemId(int position) { return position; }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            TextView textView = new TextView(CalenderActivity.this);
            textView.setLayoutParams(new GridView.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    (int) (getResources().getDisplayMetrics().density * 50)));
            textView.setGravity(View.TEXT_ALIGNMENT_CENTER);
            textView.setPadding(8, 8, 8, 8);

            String day = getItem(position);
            textView.setText(day);

            if (!day.isEmpty()) {
                int dayNumber = Integer.parseInt(day);
                textView.setBackgroundColor(selectedDays.contains(dayNumber) ?
                        Color.GREEN : Color.TRANSPARENT);
            } else {
                textView.setBackgroundColor(Color.TRANSPARENT);
            }

            return textView;
        }
    }
}
