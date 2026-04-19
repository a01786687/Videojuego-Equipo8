CREATE DATABASE IF NOT EXISTS meow_cafe;
USE meow_cafe;

CREATE TABLE cats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age VARCHAR(50),
    personality VARCHAR(50),
    image VARCHAR(200)
);

CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(20),
    name VARCHAR (100),
    description VARCHAR(300),
    image VARCHAR(200)
);

