package com.example.visionsoil;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;

import androidx.appcompat.app.AppCompatActivity;

public class HomeActivity extends AppCompatActivity {

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);
        ImageView connect = findViewById(R.id.connect);

        ImageView Robot = findViewById(R.id.Robot);
        ImageView Planning = findViewById(R.id.Planning);
        ImageView Data = findViewById(R.id.Data);
        connect.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(HomeActivity.this, MainActivity.class);
                startActivity(intent);
            }
        });

        Robot.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(HomeActivity.this, controlleRrobot.class);
                startActivity(intent);
            }
        });

        Planning.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(HomeActivity.this, CalenderActivity.class);
                startActivity(intent);
            }
        });

        Data.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(HomeActivity.this, MainActivity1.class);
                startActivity(intent);
            }
        });



    }
}
