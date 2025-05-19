package com.example.visionsoil;

import com.github.mikephil.charting.formatter.ValueFormatter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DateAxisFormatter extends ValueFormatter {
    private final SimpleDateFormat mFormat;

    public DateAxisFormatter() {
        mFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());
    }

    @Override
    public String getFormattedValue(float value) {
        return mFormat.format(new Date((long) value));
    }
}