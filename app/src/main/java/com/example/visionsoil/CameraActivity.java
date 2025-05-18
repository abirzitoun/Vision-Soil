package com.example.visionsoil;

import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.io.IOException;
import java.io.OutputStream;

public class CameraActivity extends AppCompatActivity {
    private ImageView ledIndicator;
    private Handler handler = new Handler();
    private boolean isLedOn = false;
    private boolean isConnected = false;
    private OutputStream mmOutStream;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);


        // Add click listener to rectangleTopLeft
        View forwad= findViewById(R.id.btnLeft);
        forwad.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("F"); // Send "F" to Arduino

            } else {
                Toast.makeText(CameraActivity.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View turnRigth= findViewById(R.id.btnRight);
        turnRigth.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("R");

            } else {
                Toast.makeText(CameraActivity.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View Back= findViewById(R.id.btnAction1);
        Back.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("B");

            } else {
                Toast.makeText(CameraActivity.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View turnLeft= findViewById(R.id.btnAction2);
        turnLeft.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("L");
            } else {
                Toast.makeText(CameraActivity.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });

    }

    private void sendCommand(String command) {
        try {
            mmOutStream.write(command.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
