package com.example.visionsoil;


import android.graphics.Color;
import android.os.Bundle;

import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import java.util.ArrayList;

public class SoilMoistureChartActivity extends BaseChartActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        dataPath = "soil_moisture";
        chartTitle = "Soil Moisture";
        maxValue = 100; // Percentage
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void setupChart() {
        pieChart.setUsePercentValues(true);
        pieChart.getDescription().setEnabled(false);
        pieChart.setEntryLabelTextSize(12f);
        pieChart.setEntryLabelColor(Color.BLACK);
        pieChart.setCenterTextSize(16f);
        pieChart.setDrawEntryLabels(false);
    }

    @Override
    protected void updateChart(float moistureValue) {
        ArrayList<PieEntry> entries = new ArrayList<>();
        entries.add(new PieEntry(moistureValue, "Current Moisture"));
        entries.add(new PieEntry(maxValue - moistureValue, "Remaining"));

        int[] colors;
        if (moistureValue < 30) {
            colors = new int[]{Color.RED, Color.LTGRAY}; // Dry
        } else if (moistureValue < 50) {
            colors = new int[]{Color.YELLOW, Color.LTGRAY}; // Moderate
        } else {
            colors = new int[]{Color.GREEN, Color.LTGRAY}; // Good
        }

        PieDataSet dataSet = new PieDataSet(entries, chartTitle);
        dataSet.setColors(colors);
        dataSet.setValueTextSize(14f);
        dataSet.setValueTextColor(Color.WHITE);

        PieData data = new PieData(dataSet);
        pieChart.setData(data);
        pieChart.invalidate();

        // Update center text
        pieChart.setCenterText(String.format("%.1f%%\nMoisture", moistureValue));
    }
}