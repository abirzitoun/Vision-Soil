package com.example.visionsoil;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import com.example.visionsoil.Entity.User;
import com.example.visionsoil.Utils.NetworkUtils;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class MyDatabaseHelper {
    private static final String BASE_URL = "http://192.168.221.45/visionsoil_api/api.php";
    private Context context;

    public MyDatabaseHelper(Context context) {
        this.context = context;
    }

    public interface UserOperationCallback {
        void onSuccess(User user);
        void onError(String error);
    }

    public void loginUser(String email, String password, UserOperationCallback callback) {
        if (!NetworkUtils.isNetworkAvailable(context)) {
            callback.onError("No network connection");
            return;
        }
        new LoginTask(email, password, callback).execute();
    }

    private static class LoginTask extends AsyncTask<Void, Void, Void> {
        private String email;
        private String password;
        private UserOperationCallback callback;
        private User user = null;
        private String error = null;

        LoginTask(String email, String password, UserOperationCallback callback) {
            this.email = email;
            this.password = password;
            this.callback = callback;
        }

        @Override
        protected Void doInBackground(Void... voids) {
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;

            try {
                URL url = new URL(BASE_URL + "?action=login&email=" +
                        URLEncoder.encode(email, "UTF-8") +
                        "&password=" + URLEncoder.encode(password, "UTF-8"));
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("GET");

                InputStream inputStream = urlConnection.getInputStream();
                StringBuilder buffer = new StringBuilder();
                reader = new BufferedReader(new InputStreamReader(inputStream));

                String line;
                while ((line = reader.readLine()) != null) {
                    buffer.append(line);
                }

                JSONObject jsonObject = new JSONObject(buffer.toString());

                if (jsonObject.has("error")) {
                    error = jsonObject.getString("error");
                } else {
                    user = new User(
                            jsonObject.getInt("id"),
                            jsonObject.getString("first_name"),
                            jsonObject.getString("last_name"),
                            jsonObject.getString("email"),
                            jsonObject.optString("phone_number", null),
                            "", // Password not included in response
                            jsonObject.getString("role"),
                            jsonObject.optString("image_url", null),
                            jsonObject.getString("status")
                    );
                }
            } catch (Exception e) {
                error = e.getMessage();
                Log.e("LoginTask", "Error during login", e);
            } finally {
                if (urlConnection != null) urlConnection.disconnect();
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
            return null;
        }

        // Add this method to your MySQLDatabaseHelper class
        public void registerUser(User user, UserOperationCallback callback) {
            new RegisterTask(user, callback).execute();
        }

        private static class RegisterTask extends AsyncTask<Void, Void, Void> {
            private User user;
            private UserOperationCallback callback;
            private String error = null;

            RegisterTask(User user, UserOperationCallback callback) {
                this.user = user;
                this.callback = callback;
            }

            @Override
            protected Void doInBackground(Void... voids) {
                HttpURLConnection urlConnection = null;
                BufferedReader reader = null;

                try {
                    URL url = new URL(BASE_URL);
                    urlConnection = (HttpURLConnection) url.openConnection();
                    urlConnection.setRequestMethod("POST");
                    urlConnection.setRequestProperty("Content-Type", "application/json");
                    urlConnection.setDoOutput(true);

                    JSONObject jsonParam = new JSONObject();
                    jsonParam.put("action", "register");
                    jsonParam.put("first_name", user.getFirstName());
                    jsonParam.put("last_name", user.getLastName());
                    jsonParam.put("email", user.getEmail());
                    jsonParam.put("phone_number", user.getPhoneNumber());
                    jsonParam.put("password", user.getPassword());
                    jsonParam.put("role", user.getRole());

                    OutputStream os = urlConnection.getOutputStream();
                    os.write(jsonParam.toString().getBytes(StandardCharsets.UTF_8));
                    os.close();

                    InputStream inputStream = urlConnection.getInputStream();
                    StringBuilder response = new StringBuilder();
                    reader = new BufferedReader(new InputStreamReader(inputStream));

                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    if (jsonResponse.has("error")) {
                        error = jsonResponse.getString("error");
                    }
                } catch (Exception e) {
                    error = e.getMessage();
                    Log.e("RegisterTask", "Registration error", e);
                } finally {
                    if (urlConnection != null) urlConnection.disconnect();
                    if (reader != null) try { reader.close(); } catch (IOException e) {}
                }
                return null;
            }

            @Override
            protected void onPostExecute(Void aVoid) {
                if (error != null) {
                    callback.onError(error);
                } else {
                    callback.onSuccess(user);
                }
            }
        }
        @Override
        protected void onPostExecute(Void aVoid) {
            if (error != null) {
                callback.onError(error);
            } else {
                callback.onSuccess(user);
            }
        }
    }
}