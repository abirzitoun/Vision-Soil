package com.example.visionsoil;
import android.graphics.Color;
import android.os.Bundle;

import com.github.mikephil.charting.animation.Easing;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;

import java.util.ArrayList;

public class CO2ChartActivity extends BaseChartActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        dataPath = "co2";
        chartTitle = "CO2 Levels";
        maxValue = 2000;
        super.onCreate(savedInstanceState);
    }
        @Override
        protected void setupChart() {
            pieChart.setUsePercentValues(true);
            pieChart.getDescription().setEnabled(false);
            pieChart.setExtraOffsets(5, 10, 5, 5);
            pieChart.setDragDecelerationFrictionCoef(0.95f);
            pieChart.setDrawHoleEnabled(true);
            pieChart.setHoleColor(Color.WHITE);
            pieChart.setTransparentCircleRadius(61f);
            pieChart.animateY(1000, Easing.EaseInOutCubic);
        }
        @Override
        protected void updateChart(float co2Value) {
            ArrayList<PieEntry> entries = new ArrayList<>();
            entries.add(new PieEntry(co2Value, "Current CO₂"));
            entries.add(new PieEntry(2000 - co2Value, "Safe Range"));

            PieDataSet dataSet = new PieDataSet(entries, "CO₂ Levels");
            dataSet.setColors(new int[]{co2Value > 1000 ? Color.RED : Color.GREEN, Color.LTGRAY});
            dataSet.setValueTextSize(12f);
            dataSet.setValueTextColor(Color.WHITE);

            PieData data = new PieData(dataSet);
            pieChart.setData(data);
            pieChart.invalidate();
        }

}