package com.example.visionsoil;

import android.bluetooth.BluetoothSocket;

import java.io.IOException;

public class BluetoothSocketWrapper {
    private static BluetoothSocketWrapper instance;
    private BluetoothSocket mmSocket;

    // Private constructor to prevent instantiation
    private BluetoothSocketWrapper() {}

    // Singleton instance getter
    public static BluetoothSocketWrapper getInstance() {
        if (instance == null) {
            instance = new BluetoothSocketWrapper();
        }
        return instance;
    }

    // Set the BluetoothSocket
    public void setSocket(BluetoothSocket socket) {
        this.mmSocket = socket;
    }

    // Get the BluetoothSocket
    public BluetoothSocket getSocket() {
        return mmSocket;
    }

    // Close the socket and clean up
    public void closeSocket() {
        if (mmSocket != null) {
            try {
                mmSocket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}