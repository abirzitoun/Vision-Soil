package com.example.visionsoil;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.github.mikephil.charting.charts.PieChart;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
public abstract class BaseChartActivity extends AppCompatActivity {
    protected DatabaseReference databaseReference;
    protected String dataPath;
    protected String chartTitle;
    protected float maxValue;
    protected PieChart pieChart;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_base_chart);
        pieChart = findViewById(R.id.pieChart);
        databaseReference = FirebaseDatabase.getInstance().getReference("sensor_data");
        setupChart();
        setupFirebaseListener();

    }

    protected abstract void setupChart();
    protected abstract void updateChart(float value);

    private void setupFirebaseListener() {
        databaseReference.child(dataPath).addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                Float value = snapshot.getValue(Float.class);
                if (value != null) updateChart(value);
            }
            @Override
            public void onCancelled(@NonNull DatabaseError error) {

            }
        });
    }

}