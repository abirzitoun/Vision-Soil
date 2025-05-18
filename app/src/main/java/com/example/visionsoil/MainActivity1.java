package com.example.visionsoil;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.card.MaterialCardView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity1 extends AppCompatActivity {
    TextView tempText, humidText, luminosityText, co2Text, covText, soilMoistureText;
    private TextView notificationBadge;
    private boolean isConnected = false;
    private ImageView ledIndicator;
    private Handler handler = new Handler();
    private boolean isLedOn = false;
    private OutputStream mmOutStream;
    private RequestQueue requestQueue;
    private Timer dataUpdateTimer;

    private static final int SMS_PERMISSION_REQUEST_CODE = 100;
    private static final String API_URL = "http://192.168.221.45/visionsoil_api/get_sensor_data.php";

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main1);
        requestQueue = Volley.newRequestQueue(this);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.SEND_SMS}, SMS_PERMISSION_REQUEST_CODE);
        }

        isConnected = getIntent().getBooleanExtra("DEVICE_CONNECTED", false);

        // Initialize views
        ledIndicator = findViewById(R.id.ledIndicator);
        ImageView connectImageView = findViewById(R.id.connect);



        co2Text = findViewById(R.id.co2TextView);
        covText = findViewById(R.id.covTextView);
        soilMoistureText = findViewById(R.id.soilMoistureTextView);
        tempText = findViewById(R.id.tempTextView);
        humidText = findViewById(R.id.humidTextView);
        luminosityText = findViewById(R.id.luminosityTextView);

        // Set click listeners for chart views
        co2Text.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity1.this, CO2ChartActivity.class));
        });
        covText.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity1.this, COVChartActivity.class));
        });
        humidText.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity1.this, HumidityChartActivity.class));
        });
        soilMoistureText.setOnClickListener(v -> {
            startActivity(new Intent(MainActivity1.this, SoilMoistureChartActivity.class));
        });

        // Update the LED indicator based on the connection status
        if (isConnected) {
            ledIndicator.setImageResource(R.drawable.circle_led_on);
        }

        // Set up the connect button click listener
    

        try {
            if (BluetoothSocketWrapper.getInstance().getSocket() != null) {
                mmOutStream = BluetoothSocketWrapper.getInstance().getSocket().getOutputStream();
            } else {
                showToast("Bluetooth socket is not connected");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Start periodic data updates
        startDataUpdates();
    }

    private void startDataUpdates() {
        // Update immediately
        fetchSensorData();

        // Then update every 5 seconds
        dataUpdateTimer = new Timer();
        dataUpdateTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                fetchSensorData();
            }
        }, 0, 5000);
    }

    private void fetchSensorData() {
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(
                Request.Method.GET,
                API_URL,
                null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            // Parse the response
                            double temperature = response.getDouble("temperature");
                            double humidity = response.getDouble("humidity");
                            double luminosity = response.getDouble("luminosity");
                            double soilMoisture = response.getDouble("soil_moisture");
                            double co2 = response.getDouble("co2");
                            double cov = response.getDouble("cov");

                            // Update UI
                            updateSensorUI(temperature, humidity, luminosity, soilMoisture, co2, cov);
                        } catch (JSONException e) {
                            Log.e("JSONError", "Error parsing sensor data", e);
                            showToast("Error parsing sensor data");
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        String errorMessage = "Error fetching sensor data";
                        if (error.networkResponse != null) {
                            errorMessage += " (Code: " + error.networkResponse.statusCode + ")";
                            try {
                                String responseBody = new String(error.networkResponse.data, "utf-8");
                                JSONObject errorObj = new JSONObject(responseBody);
                                if (errorObj.has("error")) {
                                    errorMessage += ": " + errorObj.getString("error");
                                }
                            } catch (Exception e) {
                                Log.e("VolleyError", "Error parsing error response", e);
                            }
                        }
                        Log.e("VolleyError", errorMessage, error);
                        showToast(errorMessage);
                    }
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Type", "application/json");
                return headers;
            }
        };

        // Set retry policy
        jsonObjectRequest.setRetryPolicy(new DefaultRetryPolicy(
                10000, // 10 seconds timeout
                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

        requestQueue.add(jsonObjectRequest);
    }
    private void updateSensorUI(double temperature, double humidity, double luminosity,
                                double soilMoisture, double co2, double cov) {
        runOnUiThread(() -> {
            // Update temperature
            tempText.setText("Temperature: " + temperature + "°C");
            if (temperature < 15.0) {
                tempText.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "❄️ LOW TEMP! 🚨 " + temperature + "°C. Freezing risk! 🥶🔥");
            } else if (temperature > 30.0) {
                tempText.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "🔥 HIGH TEMP! 🚨 " + temperature + "°C. Risk of overheating! ☀️⚠️");
            } else {
                tempText.setTextColor(Color.BLUE);
            }

            // Update humidity
            humidText.setText("Humidity: " + humidity + "%");
            if (humidity < 30.0 || humidity > 70.0) {
                sendSuccessSms("+21621843815", "🚨 ALERT! 🚨 Humidity is at " + humidity + "%. Immediate action required! ⚠️");
                humidText.setTextColor(Color.RED);
            } else {
                humidText.setTextColor(Color.BLUE);
            }

            // Update luminosity
            luminosityText.setText("Luminosity: " + luminosity + " Lux");
            if (luminosity < 100.0) {
                sendSuccessSms("+21621843815", "⚠️ ALERT! 🌑 Luminosity at " + luminosity + "Lux. Too dark, add light! 💡");
                luminosityText.setTextColor(Color.RED);
            } else if (luminosity > 1000.0) {
                sendSuccessSms("+21621843815", "⚠️ HIGH LIGHT ALERT! ☀️ " + luminosity + "Lux. Too bright 🕶️");
                luminosityText.setTextColor(Color.RED);
            } else {
                luminosityText.setTextColor(Color.BLUE);
            }

            // Update CO2
            co2Text.setText("CO₂: " + co2 + " ppm");
            if (co2 > 1000) {
                co2Text.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "⚠️ HIGH CO₂! 🚨 " + co2 + "ppm. Ventilate now! 🏠💨");
            } else {
                co2Text.setTextColor(Color.BLUE);
            }

            // Update COV
            covText.setText("COV: " + cov + " ppb");
            if (cov > 500) {
                covText.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "⚠️ HIGH COV! 🚨 " + cov + "ppb. Potential contamination! 🏭☠️");
            } else {
                covText.setTextColor(Color.BLUE);
            }

            // Update Soil Moisture (using soilPH field)
            soilMoistureText.setText("Soil Moisture: " + soilMoisture + "%");
            if (soilMoisture < 30.0) {
                soilMoistureText.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "⚠️ LOW SOIL MOISTURE! 🚨 " + soilMoisture + "%. Water plants! 🌱💧");
            } else if (soilMoisture > 80.0) {
                soilMoistureText.setTextColor(Color.RED);
                sendSuccessSms("+21621843815", "⚠️ HIGH SOIL MOISTURE! 🚨 " + soilMoisture + "%.Risk of overwatering! 🌱🚱");
            } else {
                soilMoistureText.setTextColor(Color.BLUE);
            }
        });
    }

    private void sendCommand(String command) {
        try {
            if (mmOutStream != null) {
                mmOutStream.write(command.getBytes());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void showMenuDialog() {
        Dialog dialog = new Dialog(this);
        dialog.setContentView(R.layout.menu_layout);

        TextView connectToCar = dialog.findViewById(R.id.connect_to_car);
        TextView settings = dialog.findViewById(R.id.settings);
        TextView closeApp = dialog.findViewById(R.id.close_app);

        connectToCar.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity1.this, MainActivity.class);
            startActivity(intent);
            dialog.dismiss();
        });

        settings.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity1.this, SettingsActivity.class);
            startActivity(intent);
            dialog.dismiss();
        });

        closeApp.setOnClickListener(v -> {
            finish();
            dialog.dismiss();
        });

        dialog.show();
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void sendSuccessSms(String phoneNumber, String message) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            Toast.makeText(this, "SMS Sent to " + phoneNumber, Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Log.e("SMS_ERROR", "Failed to send SMS: " + e.getMessage());
            Toast.makeText(this, "Failed to send SMS", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
        if (dataUpdateTimer != null) {
            dataUpdateTimer.cancel();
        }
        if (requestQueue != null) {
            requestQueue.cancelAll(this);
        }
    }
}