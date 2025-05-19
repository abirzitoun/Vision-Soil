package com.example.visionsoil;

import android.graphics.Color;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import java.util.ArrayList;
import java.util.List;

public class TemperatureChartActivity extends AppCompatActivity {

    private LineChart temperatureChart;
    private DatabaseReference databaseReference;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_temperature_chart);

        temperatureChart = findViewById(R.id.temperatureChart);
        setupChart();

        // Initialize Firebase reference to historical data
        databaseReference = FirebaseDatabase.getInstance().getReference("sensor_data_history");

        loadTemperatureData();
    }

    private void setupChart() {
        // Configure chart appearance
        temperatureChart.getDescription().setEnabled(false);
        temperatureChart.setTouchEnabled(true);
        temperatureChart.setDragEnabled(true);
        temperatureChart.setScaleEnabled(true);
        temperatureChart.setPinchZoom(true);

        XAxis xAxis = temperatureChart.getXAxis();
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setGranularity(1f);
        xAxis.setValueFormatter(new DateAxisFormatter()); // You'll need to implement this

        YAxis leftAxis = temperatureChart.getAxisLeft();
        leftAxis.setAxisMinimum(0f);
        leftAxis.setAxisMaximum(50f);
        leftAxis.setGranularity(1f);
        leftAxis.setTextColor(Color.BLACK);

        temperatureChart.getAxisRight().setEnabled(false);
    }

    private void loadTemperatureData() {
        databaseReference.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Entry> entries = new ArrayList<>();
                int index = 0;

                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Float temperature = snapshot.child("temperature").getValue(Float.class);
                    Long timestamp = snapshot.child("timestamp").getValue(Long.class);

                    if (temperature != null && timestamp != null) {
                        entries.add(new Entry(timestamp.floatValue(), temperature));
                        index++;
                    }
                }

                if (!entries.isEmpty()) {
                    LineDataSet dataSet = new LineDataSet(entries, "Temperature (°C)");
                    dataSet.setColor(Color.RED);
                    dataSet.setLineWidth(2f);
                    dataSet.setCircleColor(Color.RED);
                    dataSet.setCircleRadius(4f);
                    dataSet.setValueTextSize(10f);

                    LineData lineData = new LineData(dataSet);
                    temperatureChart.setData(lineData);
                    temperatureChart.invalidate(); // refresh chart
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                // Handle error
            }
        });
    }
}