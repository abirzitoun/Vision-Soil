package com.example.visionsoil;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.github.mikephil.charting.charts.PieChart;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import com.github.mikephil.charting.utils.ColorTemplate;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import java.util.ArrayList;

public class HumidityChartActivity extends AppCompatActivity {

    private PieChart humidityDoughnutChart;
    private TextView humidText;
    private DatabaseReference databaseReference;

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_humidity_chart);

        // Initialize the chart and TextView
        humidityDoughnutChart = findViewById(R.id.humidityDoughnutChart);
        humidText = findViewById(R.id.humidTextView);

        // Initialize Firebase database reference
        databaseReference = FirebaseDatabase.getInstance().getReference("sensor_data");

        // Set up the PieChart (Doughnut chart)
        setupDoughnutChart();

        // Fetch humidity data from Firebase
        databaseReference.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Float humidity = getFloatValue(dataSnapshot, "humidity");
                    updateDoughnutChart(humidity);
                    humidText.setText("Humidity: " + humidity + "%");
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                Log.e("FirebaseError", "Database error: " + databaseError.getMessage());
            }
        });
    }

    private void setupDoughnutChart() {
        humidityDoughnutChart.setUsePercentValues(true);
        humidityDoughnutChart.getDescription().setEnabled(false);
        humidityDoughnutChart.setDrawHoleEnabled(true);
        humidityDoughnutChart.setHoleColor(Color.TRANSPARENT);
        humidityDoughnutChart.setHoleRadius(50f);
        humidityDoughnutChart.setTransparentCircleRadius(70f);
        humidityDoughnutChart.setDrawRoundedSlices(true);
    }

    private void updateDoughnutChart(float humidity) {
         ArrayList<PieEntry> entries = new ArrayList<>();
        entries.add(new PieEntry(humidity, "Humidity"));
        entries.add(new PieEntry(100 - humidity, "Remaining"));

        PieDataSet dataSet = new PieDataSet(entries, "Humidity Levels");
        dataSet.setColors(ColorTemplate.COLORFUL_COLORS);

        PieData pieData = new PieData(dataSet);
        humidityDoughnutChart.setData(pieData);

        humidityDoughnutChart.invalidate();
    }

    private Float getFloatValue(DataSnapshot snapshot, String path) {
        if (snapshot.child(path).exists()) {
            return snapshot.child(path).getValue(Float.class);
        }
        return 0.0f;
    }
}
