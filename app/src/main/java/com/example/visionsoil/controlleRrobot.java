package com.example.visionsoil;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import java.io.IOException;
import java.io.OutputStream;

public class controlleRrobot extends AppCompatActivity {
    private ImageView ledIndicator;
    private Handler handler = new Handler();
    private boolean isLedOn = false;
    private boolean isConnected = false;
    private WebView webView;
    private OutputStream mmOutStream; // Add this line

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_controlle_rrobot);

        ImageView alertImageView = findViewById(R.id.alert);

        // Set an OnClickListener on the ImageView
        alertImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Create an intent to go to MainActivity
                Intent intent = new Intent(controlleRrobot.this, MainActivity1.class);
                startActivity(intent);
            }
        });

        // Retrieve the connection status from the Intent
        isConnected = getIntent().getBooleanExtra("DEVICE_CONNECTED", false);

        // Initialize views
        ledIndicator = findViewById(R.id.ledIndicator);
        ImageView connectImageView = findViewById(R.id.connect);
        ImageView camera = findViewById(R.id.streaming);
        camera.setOnClickListener(view -> {

                // Navigate back to MainActivity to show the connected device and disconnect button
                Intent intent = new Intent(controlleRrobot.this, CameraActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);

        });


        // Update the LED indicator based on the connection status
        if (isConnected) {
            // If connected, set the LED to solid green
            ledIndicator.setImageResource(R.drawable.circle_led_on); // Green LED
        } else {
            // If disconnected, start blinking in red
            startBlinking();
        }

        // Set up the connect button click listener
        connectImageView.setOnClickListener(view -> {
            if (isConnected) {
                // Navigate back to MainActivity to show the connected device and disconnect button
                Intent intent = new Intent(controlleRrobot.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
            } else {
                // If not connected, show the menu dialog
                showMenuDialog();
            }
        });

        // Initialize the Bluetooth output stream
        try {
            if (BluetoothSocketWrapper.getInstance().getSocket() != null) {
                mmOutStream = BluetoothSocketWrapper.getInstance().getSocket().getOutputStream();
            } else {
                showToast("Bluetooth socket is not connected");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Add click listener to rectangleTopLeft
        View forwad= findViewById(R.id.rectangleTopLeft);
        forwad.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("F"); // Send "F" to Arduino

            } else {
                Toast.makeText(controlleRrobot.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View turnRigth= findViewById(R.id.rectangleTopRight);
        turnRigth.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("R"); // Send "F" to Arduino

            } else {
                Toast.makeText(controlleRrobot.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View Back= findViewById(R.id.rectangleBottomLeft);
        Back.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("B"); // Send "F" to Arduino

            } else {
                Toast.makeText(controlleRrobot.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        View turnLeft= findViewById(R.id.rectangleBottomRight);
        turnLeft.setOnClickListener(v -> {
            if (isConnected) {
                sendCommand("L"); // Send "F" to Arduino
            } else {
                Toast.makeText(controlleRrobot.this, "Not connected", Toast.LENGTH_SHORT).show();
            }
        });
        webView = findViewById(R.id.spaceTop);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true; // Garde la navigation dans WebView
            }
        });

        // Activer le débogage WebView
        WebView.setWebContentsDebuggingEnabled(true);

        // Charger directement l'URL fixe
        webView.loadUrl("http://192.168.221.202:8080");
    }

    private void sendCommand(String command) {
        try {
            mmOutStream.write(command.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void showMenuDialog() {
        // Create a dialog
        Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.menu_layout); // Use the custom layout

        // Find views in the custom layout
        TextView connectToCar = dialog.findViewById(R.id.connect_to_car);
        TextView settings = dialog.findViewById(R.id.settings);
        TextView closeApp = dialog.findViewById(R.id.close_app);

        // Set click listeners for the menu options
        connectToCar.setOnClickListener(v -> {
            Intent intent = new Intent(controlleRrobot.this, MainActivity.class);
            startActivity(intent);
            dialog.dismiss(); // Close the dialog
        });

        // Inside the showMenuDialog() method in controlleRrobot.java
        settings.setOnClickListener(v -> {
            // Navigate to the SettingsActivity
            Intent intent = new Intent(controlleRrobot.this, SettingsActivity.class);
            startActivity(intent);
            dialog.dismiss(); // Close the dialog
        });

        closeApp.setOnClickListener(v -> {
            finish(); // Close the app
            dialog.dismiss(); // Close the dialog
        });

        // Show the dialog
        dialog.show();
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void startBlinking() {
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (!isConnected) { // Only blink if disconnected
                    // Toggle the LED state between red and off
                    if (isLedOn) {
                        ledIndicator.setImageResource(R.drawable.circle_led_off); // Off
                    } else {
                        ledIndicator.setImageResource(R.drawable.circle_led_blink); // Red
                    }
                    isLedOn = !isLedOn; // Toggle the state

                    // Repeat the process after a delay
                    handler.postDelayed(this, 300); // Blink every 500ms
                }
            }
        }, 500); // Initial delay
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Stop the blinking when the activity is destroyed
        handler.removeCallbacksAndMessages(null);
    }
}