package com.example.visionsoil;

import android.annotation.SuppressLint;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.visionsoil.Entity.User;

public class LoginActivity extends AppCompatActivity {
    private EditText editTextEmail, editTextPassword;
    private ImageButton buttonLogin;
    private MyDatabaseHelper databaseHelper;
    private TextView textViewRegisterNow, textViewForgotPassword;
    private ProgressDialog progressDialog;

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login);

        // Initialize views
        textViewRegisterNow = findViewById(R.id.textViewRegisterNow);

        editTextEmail = findViewById(R.id.editTextEmail);
        editTextPassword = findViewById(R.id.editTextPassword);
        buttonLogin = findViewById(R.id.buttonLogin);

        // Initialize database helper
        databaseHelper = new MyDatabaseHelper(this);

        // Initialize progress dialog
        progressDialog = new ProgressDialog(this);
        progressDialog.setMessage("Authenticating...");
        progressDialog.setCancelable(false);



        buttonLogin.setOnClickListener(v -> authenticateUser());
    }

    private void authenticateUser() {
        String email = editTextEmail.getText().toString().trim();
        String password = editTextPassword.getText().toString().trim();

        // Validate inputs
        if (email.isEmpty()) {
            editTextEmail.setError("Email is required");
            editTextEmail.requestFocus();
            return;
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            editTextEmail.setError("Enter a valid email");
            editTextEmail.requestFocus();
            return;
        }

        if (password.isEmpty()) {
            editTextPassword.setError("Password is required");
            editTextPassword.requestFocus();
            return;
        }

        progressDialog.show();

        databaseHelper.loginUser(email, password, new MyDatabaseHelper.UserOperationCallback() {
            @Override
            public void onSuccess(User user) {
                progressDialog.dismiss();
                handleLoginSuccess(user);
            }

            @Override
            public void onError(String error) {
                progressDialog.dismiss();
                Toast.makeText(LoginActivity.this, error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void handleLoginSuccess(User user) {
        if (!"approved".equals(user.getStatus())) {
            String statusMessage = "Account is " + user.getStatus() + ". Please wait for approval.";
            Toast.makeText(this, statusMessage, Toast.LENGTH_LONG).show();
            return;
        }

        Toast.makeText(this, "Login successful", Toast.LENGTH_SHORT).show();

        Intent intent = new Intent(this, HomeActivity.class);
        intent.putExtra("USER_ID", user.getId());
        intent.putExtra("USER_EMAIL", user.getEmail());
        intent.putExtra("USER_ROLE", user.getRole());
        intent.putExtra("USER_NAME", user.getFirstName() + " " + user.getLastName());
        startActivity(intent);
        finish();
    }

    @Override
    protected void onDestroy() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
        super.onDestroy();
    }
}