package com.example.visionsoil.Service;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Update;

import com.example.visionsoil.Entity.User;

@Dao
public interface UserDao {


    @Update
    void updateUser(User user);

    @Insert
    void insertUser(User user);
}
