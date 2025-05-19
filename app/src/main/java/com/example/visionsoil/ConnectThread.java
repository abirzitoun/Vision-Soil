package com.example.visionsoil;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.os.Handler;
import android.util.Log;

import java.io.IOException;
import java.util.UUID;

public class ConnectThread extends Thread {
    private final BluetoothSocket mmSocket;
    private static final String TAG = "FrugalLogs";
    public static Handler handler;

    @SuppressLint("MissingPermission")
    public ConnectThread(BluetoothDevice device, UUID MY_UUID, Handler handler) {
        BluetoothSocket tmp = null;
        this.handler = handler;

        try {
            tmp = device.createRfcommSocketToServiceRecord(MY_UUID);
        } catch (IOException e) {
            Log.e(TAG, "Socket's create() method failed", e);
        }
        mmSocket = tmp;
    }

    @SuppressLint("MissingPermission")
    public void run() {
        try {
            mmSocket.connect();
            Log.d(TAG, "Connected to device: " + mmSocket.getRemoteDevice().getName());
        } catch (IOException connectException) {
            Log.e(TAG, "Connection failed: " + connectException.getMessage());
            try {
                mmSocket.close();
            } catch (IOException closeException) {
                Log.e(TAG, "Could not close the client socket", closeException);
            }
            return;
        }

        Log.d(TAG, "Connection successful");
    }

    public void cancel() {
        try {
            mmSocket.close();
            Log.d(TAG, "Socket closed");
        } catch (IOException e) {
            Log.e(TAG, "Could not close the client socket", e);
        }
    }

    public BluetoothSocket getMmSocket() {
        return mmSocket;
    }
}