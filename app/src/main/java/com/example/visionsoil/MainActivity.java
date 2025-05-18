package com.example.visionsoil;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.schedulers.Schedulers;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "FrugalLogs";
    private static final int REQUEST_ENABLE_BT = 1;
    private static final int REQUEST_BLUETOOTH_PERMISSION = 2;
    public static Handler handler;
    private final static int ERROR_READ = 0;
    BluetoothDevice arduinoBTModule = null;
    UUID arduinoUUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private ListView deviceList;
    private ArrayAdapter<String> deviceListAdapter;
    private ListView connectedDeviceList;
    private ArrayAdapter<String> connectedDeviceAdapter;
    private Button disconnectButton;
    private ConnectThread connectThread;
    private ConnectedThread connectedThread;
    private BluetoothAdapter bluetoothAdapter;

    @SuppressLint("CheckResult")
    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Bluetooth
        BluetoothManager bluetoothManager = getSystemService(BluetoothManager.class);
        bluetoothAdapter = bluetoothManager.getAdapter();

        // Initialize handler
        handler = new Handler(Looper.getMainLooper());

        // Initialize UI components
        Button connectToDevice = findViewById(R.id.connectToDevice);
        Button searchDevices = findViewById(R.id.seachDevices);
        Button refresh = findViewById(R.id.refresh);
        deviceList = findViewById(R.id.deviceList);
        disconnectButton = findViewById(R.id.disconnectButton);
        connectedDeviceList = findViewById(R.id.connectedDeviceList);

        // Initialize adapters
        deviceListAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
        deviceList.setAdapter(deviceListAdapter);

        connectedDeviceAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, new ArrayList<>());
        connectedDeviceList.setAdapter(connectedDeviceAdapter);

        // Set initial button states
        connectToDevice.setEnabled(false);
        disconnectButton.setEnabled(false);
        disconnectButton.setVisibility(View.GONE);

        // Search for paired devices
        searchDevices.setOnClickListener(view -> handleDeviceSearch());

        // Handle device selection
        deviceList.setOnItemClickListener((parent, view, position, id) -> {
            String deviceInfo = deviceListAdapter.getItem(position);
            String deviceAddress = deviceInfo.split("\n")[1];
            arduinoBTModule = bluetoothAdapter.getRemoteDevice(deviceAddress);
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return;
            }
            Toast.makeText(MainActivity.this, "Selected: " + arduinoBTModule.getName(), Toast.LENGTH_SHORT).show();
            connectToDevice.setEnabled(true);
        });

        // Connect to the selected device
        connectToDevice.setOnClickListener(view -> handleDeviceConnection());

        // Disconnect from the device
        disconnectButton.setOnClickListener(view -> handleDeviceDisconnection());

        // Clear the device list
        refresh.setOnClickListener(view -> {
            deviceListAdapter.clear();
            deviceList.setVisibility(View.GONE);
            Toast.makeText(MainActivity.this, "Device list cleared", Toast.LENGTH_SHORT).show();
        });
    }

    private void handleDeviceSearch() {
        if (bluetoothAdapter == null) {
            Log.d(TAG, "Device doesn't support Bluetooth");
            Toast.makeText(this, "Bluetooth not supported", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.BLUETOOTH_CONNECT},
                        REQUEST_BLUETOOTH_PERMISSION
                );
                return;
            }
        }

        searchPairedDevices();
    }

    private void searchPairedDevices() {
        deviceListAdapter.clear();
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
        if (pairedDevices.size() > 0) {
            for (BluetoothDevice device : pairedDevices) {
                deviceListAdapter.add(device.getName() + "\n" + device.getAddress());
            }
            deviceList.setVisibility(View.VISIBLE);
        } else {
            Toast.makeText(this, "No paired devices found", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleDeviceConnection() {
        if (arduinoBTModule == null) {
            Toast.makeText(this, "No device selected", Toast.LENGTH_SHORT).show();
            return;
        }

        Observable.create(emitter -> {
                    connectThread = new ConnectThread(arduinoBTModule, arduinoUUID, handler);
                    connectThread.run();

                    BluetoothSocket socket = connectThread.getMmSocket();
                    boolean isConnected = socket != null && socket.isConnected();
                    emitter.onNext(isConnected);

                    if (isConnected) {
                        BluetoothSocketWrapper.getInstance().setSocket(socket);
                        OutputStream mmOutStream = socket.getOutputStream();
                        mmOutStream.write("connect".getBytes());

                        connectedThread = new ConnectedThread(socket);
                        connectedThread.run();
                        if (connectedThread.getValueRead() != null) {
                            emitter.onNext(connectedThread.getValueRead());
                        }
                        connectedThread.cancel();
                    }
                    connectThread.cancel();
                    emitter.onComplete();
                }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                        value -> handleConnectionResult(value),
                        throwable -> {
                            Log.e(TAG, "Connection error: " + throwable.getMessage());
                            Toast.makeText(this, "Connection failed: " + throwable.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                );
    }

    private void handleConnectionResult(Object value) {
        if (value instanceof Boolean) {
            boolean isConnected = (Boolean) value;
            if (isConnected) {
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    // TODO: Consider calling
                    //    ActivityCompat#requestPermissions
                    // here to request the missing permissions, and then overriding
                    //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                    //                                          int[] grantResults)
                    // to handle the case where the user grants the permission. See the documentation
                    // for ActivityCompat#requestPermissions for more details.
                    return;
                }
                Toast.makeText(this, "Connected to " + arduinoBTModule.getName(), Toast.LENGTH_SHORT).show();
                disconnectButton.setEnabled(true);
                disconnectButton.setVisibility(View.VISIBLE);
                findViewById(R.id.connectToDevice).setEnabled(false);

                connectedDeviceAdapter.add(arduinoBTModule.getName() + "\n" + arduinoBTModule.getAddress());
                connectedDeviceList.setVisibility(View.VISIBLE);

                Intent intent = new Intent(this, controlleRrobot.class);
                intent.putExtra("DEVICE_CONNECTED", true);
                startActivity(intent);
            } else {
                Toast.makeText(this, "Failed to connect", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void handleDeviceDisconnection() {
        if (arduinoBTModule == null) return;

        Observable.create(emitter -> {
                    BluetoothSocket socket = BluetoothSocketWrapper.getInstance().getSocket();
                    if (socket != null && socket.isConnected()) {
                        OutputStream mmOutStream = socket.getOutputStream();
                        mmOutStream.write("disconnect".getBytes());
                    }
                    BluetoothSocketWrapper.getInstance().closeSocket();
                    emitter.onNext(true);
                    emitter.onComplete();
                }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(
                        value -> handleDisconnectionResult(),
                        throwable -> {
                            Log.e(TAG, "Disconnection error: " + throwable.getMessage());
                            Toast.makeText(this, "Disconnection failed: " + throwable.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                );
    }

    private void handleDisconnectionResult() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        Toast.makeText(this, "Disconnected from " + arduinoBTModule.getName(), Toast.LENGTH_SHORT).show();
        disconnectButton.setEnabled(false);
        disconnectButton.setVisibility(View.GONE);
        findViewById(R.id.connectToDevice).setEnabled(true);

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        connectedDeviceAdapter.remove(arduinoBTModule.getName() + "\n" + arduinoBTModule.getAddress());
        if (connectedDeviceAdapter.isEmpty()) {
            connectedDeviceList.setVisibility(View.GONE);
        }

        Intent intent = new Intent(this, controlleRrobot.class);
        intent.putExtra("DEVICE_CONNECTED", false);
        startActivity(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_ENABLE_BT) {
            if (resultCode == RESULT_OK) {
                handleDeviceSearch();
            } else {
                Toast.makeText(this, "Bluetooth must be enabled", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_BLUETOOTH_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                handleDeviceSearch();
            } else {
                Toast.makeText(this, "Bluetooth permission required", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (connectThread != null) {
            connectThread.cancel();
        }
        if (connectedThread != null) {
            connectedThread.cancel();
        }
        BluetoothSocketWrapper.getInstance().closeSocket();
    }
}