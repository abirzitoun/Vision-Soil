package com.example.visionsoil.Service;

import android.content.Context;
import android.os.AsyncTask;

import com.example.visionsoil.Entity.User;
import com.example.visionsoil.MyDatabaseHelper;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class UserService implements UserDao {
    private static final String BASE_URL = "http://192.168.0.118/visionsoil_api/api.php";
    private Context context;
    private MyDatabaseHelper dbHelper;

    public UserService(Context context) {
        this.context = context;
        this.dbHelper = new MyDatabaseHelper(context);
    }

    public void loginUser(String email, String password, UserLoginCallback callback) {
        new LoginTask(email, password, callback).execute();
    }

    @Override
    public void updateUser(User user) {

    }

    @Override
    public void insertUser(User user) {

    }

    public interface PasswordUpdateCallback {
        void onResult(boolean success, String message);
    }

    public interface UserUpdateCallback {
        void onResult(boolean success, String message);
    }

    public interface UserInsertCallback {
        void onResult(boolean success, String message);
    }

    public interface UserLoginCallback {
        void onResult(boolean success, User user, String message);
    }

    private class UpdatePasswordTask extends AsyncTask<Void, Void, Boolean> {
        private String email;
        private String newPassword;
        private PasswordUpdateCallback callback;
        private String errorMessage = "";

        public UpdatePasswordTask(String email, String newPassword, PasswordUpdateCallback callback) {
            this.email = email;
            this.newPassword = newPassword;
            this.callback = callback;
        }

        @Override
        protected Boolean doInBackground(Void... voids) {
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            boolean success = false;

            try {
                URL url = new URL(BASE_URL);
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type", "application/json");
                urlConnection.setDoOutput(true);

                JSONObject jsonParam = new JSONObject();
                jsonParam.put("action", "updatePassword");
                jsonParam.put("email", email);
                jsonParam.put("newPassword", newPassword);

                OutputStream os = urlConnection.getOutputStream();
                os.write(jsonParam.toString().getBytes(StandardCharsets.UTF_8));
                os.close();

                int responseCode = urlConnection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    InputStream inputStream = urlConnection.getInputStream();
                    StringBuilder response = new StringBuilder();
                    reader = new BufferedReader(new InputStreamReader(inputStream));
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    success = jsonResponse.getBoolean("success");
                    if (!success) {
                        errorMessage = jsonResponse.getString("message");
                    }
                }
            } catch (IOException | JSONException e) {
                errorMessage = e.getMessage();
            } finally {
                if (urlConnection != null) urlConnection.disconnect();
                if (reader != null) try { reader.close(); } catch (IOException e) {}
            }
            return success;
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (callback != null) {
                callback.onResult(success, success ? "Password updated successfully" : errorMessage);
            }
        }
    }

    private class UpdateUserTask extends AsyncTask<Void, Void, Boolean> {
        private User user;
        private UserUpdateCallback callback;
        private String errorMessage = "";

        public UpdateUserTask(User user, UserUpdateCallback callback) {
            this.user = user;
            this.callback = callback;
        }

        @Override
        protected Boolean doInBackground(Void... voids) {
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            boolean success = false;

            try {
                URL url = new URL(BASE_URL);
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type", "application/json");
                urlConnection.setDoOutput(true);

                JSONObject jsonParam = new JSONObject();
                jsonParam.put("action", "updateUser");
                jsonParam.put("id", user.getId());
                jsonParam.put("first_name", user.getFirstName());
                jsonParam.put("last_name", user.getLastName());
                jsonParam.put("email", user.getEmail());
                jsonParam.put("phone_number", user.getPhoneNumber());
                jsonParam.put("role", user.getRole());
                jsonParam.put("status", user.getStatus());

                OutputStream os = urlConnection.getOutputStream();
                os.write(jsonParam.toString().getBytes(StandardCharsets.UTF_8));
                os.close();

                int responseCode = urlConnection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    InputStream inputStream = urlConnection.getInputStream();
                    StringBuilder response = new StringBuilder();
                    reader = new BufferedReader(new InputStreamReader(inputStream));
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    success = jsonResponse.getBoolean("success");
                    if (!success) {
                        errorMessage = jsonResponse.getString("message");
                    }
                }
            } catch (IOException | JSONException e) {
                errorMessage = e.getMessage();
            } finally {
                if (urlConnection != null) urlConnection.disconnect();
                if (reader != null) try { reader.close(); } catch (IOException e) {}
            }
            return success;
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (callback != null) {
                callback.onResult(success, success ? "User updated successfully" : errorMessage);
            }
        }
    }

    private class InsertUserTask extends AsyncTask<Void, Void, Boolean> {
        private User user;
        private UserInsertCallback callback;
        private String errorMessage = "";

        public InsertUserTask(User user, UserInsertCallback callback) {
            this.user = user;
            this.callback = callback;
        }

        @Override
        protected Boolean doInBackground(Void... voids) {
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            boolean success = false;

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

                int responseCode = urlConnection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    InputStream inputStream = urlConnection.getInputStream();
                    StringBuilder response = new StringBuilder();
                    reader = new BufferedReader(new InputStreamReader(inputStream));
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }

                    JSONObject jsonResponse = new JSONObject(response.toString());
                    success = jsonResponse.getBoolean("success");
                    if (!success) {
                        errorMessage = jsonResponse.getString("message");
                    }
                }
            } catch (IOException | JSONException e) {
                errorMessage = e.getMessage();
            } finally {
                if (urlConnection != null) urlConnection.disconnect();
                if (reader != null) try { reader.close(); } catch (IOException e) {}
            }
            return success;
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (callback != null) {
                callback.onResult(success, success ? "User registered successfully" : errorMessage);
            }
        }
    }

    private class LoginTask extends AsyncTask<Void, Void, JSONObject> {
        private String email;
        private String password;
        private UserLoginCallback callback;
        private String errorMessage = "";

        public LoginTask(String email, String password, UserLoginCallback callback) {
            this.email = email;
            this.password = password;
            this.callback = callback;
        }

        @Override
        protected JSONObject doInBackground(Void... voids) {
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;
            JSONObject responseJson = new JSONObject();

            try {
                URL url = new URL(BASE_URL + "?action=login&email=" + email + "&password=" + password);
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("GET");

                InputStream inputStream = urlConnection.getInputStream();
                StringBuilder response = new StringBuilder();
                reader = new BufferedReader(new InputStreamReader(inputStream));
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                responseJson = new JSONObject(response.toString());
                if (responseJson.has("error")) {
                    errorMessage = responseJson.getString("error");
                }
            } catch (IOException | JSONException e) {
                errorMessage = e.getMessage();
                try {
                    responseJson.put("error", errorMessage);
                } catch (JSONException ex) {
                    ex.printStackTrace();
                }
            } finally {
                if (urlConnection != null) urlConnection.disconnect();
                if (reader != null) try { reader.close(); } catch (IOException e) {}
            }
            return responseJson;
        }

        @Override
        protected void onPostExecute(JSONObject response) {
            if (callback != null) {
                try {
                    if (response.has("error")) {
                        callback.onResult(false, null, response.getString("error"));
                    } else {
                        User user = new User(
                                response.getInt("id"),
                                response.getString("first_name"),
                                response.getString("last_name"),
                                response.getString("email"),
                                response.optString("phone_number", null),
                                "", // Password not included in response
                                response.getString("role"),
                                response.optString("image_url", null),
                                response.getString("status")
                        );
                        callback.onResult(true, user, "Login successful");
                    }
                } catch (JSONException e) {
                    callback.onResult(false, null, "Error parsing response");
                }
            }
        }
    }
}