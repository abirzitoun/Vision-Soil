package com.example.visionsoil;

import android.graphics.Color;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import java.util.ArrayList;
public class COVChartActivity extends BaseChartActivity {
    @Override
    protected void setupChart() {
        pieChart.setDrawSliceText(false);
        pieChart.setEntryLabelTextSize(12f);
        pieChart.setEntryLabelColor(Color.BLACK);
        pieChart.getLegend().setTextSize(14f);
    }
    @Override
    protected void updateChart(float covValue) {
        ArrayList<PieEntry> entries = new ArrayList<>();
        entries.add(new PieEntry(covValue, "Current COV"));
        entries.add(new PieEntry(1000 - covValue, "Safe Range"));
        PieDataSet dataSet = new PieDataSet(entries, "COV Levels");
        dataSet.setColors(new int[]{covValue > 500 ? Color.RED : Color.YELLOW, Color.LTGRAY});
        PieData data = new PieData(dataSet);
        pieChart.setData(data);
        pieChart.invalidate();
    }
}
