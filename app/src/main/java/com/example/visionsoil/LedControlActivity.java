package com.example.visionsoil;

import android.bluetooth.BluetoothSocket;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.io.IOException;
import java.io.OutputStream;

public class LedControlActivity extends AppCompatActivity {
    private BluetoothSocket mmSocket;
    private OutputStream mmOutStream;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_led_control);

        Button ledOnButton = findViewById(R.id.ledOnButton);
        Button ledOffButton = findViewById(R.id.ledOffButton);
        Button disconnectButton = findViewById(R.id.disconnectButton);

        // Retrieve the BluetoothSocket from the Singleton
        mmSocket = BluetoothSocketWrapper.getInstance().getSocket();

        try {
            mmOutStream = mmSocket.getOutputStream();
        } catch (IOException e) {
            e.printStackTrace();
        }

        ledOnButton.setOnClickListener(view -> {
            sendCommand("LED ON"); // Send "1" to turn LED ON
            Toast.makeText(LedControlActivity.this, "LED ON", Toast.LENGTH_SHORT).show();
        });

        ledOffButton.setOnClickListener(view -> {
            sendCommand("LED OFF"); // Send "0" to turn LED OFF
            Toast.makeText(LedControlActivity.this, "LED OFF", Toast.LENGTH_SHORT).show();
        });

        disconnectButton.setOnClickListener(view -> {
            // Send "disconnect" command to Arduino
            sendCommand("disconnect");


            // Close the socket
            BluetoothSocketWrapper.getInstance().closeSocket();

            // Show toast
            Toast.makeText(LedControlActivity.this, "Disconnected", Toast.LENGTH_SHORT).show();

            // Do not navigate back to the main layout
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