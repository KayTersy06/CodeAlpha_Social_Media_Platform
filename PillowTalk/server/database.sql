CREATE DATABASE IF NOT EXISTS pillowtalk;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

CREATE TABLE followers (
    follow_id SERIAL PRIMARY KEY,
    follower_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    following_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id <> following_id)
);