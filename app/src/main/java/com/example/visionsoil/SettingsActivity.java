package com.example.visionsoil;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class SettingsActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings); // Set the layout for the settings screen

        // Find the OK button by its ID
        Button okButton = findViewById(R.id.okButton);

        // Set an OnClickListener for the OK button
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Create an Intent to navigate to the controlleRrobot activity
                Intent intent = new Intent(SettingsActivity.this, controlleRrobot.class);
                startActivity(intent); // Start the controlleRrobot activity
            }
        });
    }
}
