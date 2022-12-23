## CREATE THE DB

```
CREATE DATABASE IF NOT EXISTS `loginSystem` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

```
USE `loginSystem`;
```

## CREATE THE users TABLE

```
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    `user_name` VARCHAR(64) NOT NULL,
    `user_tag` VARCHAR(8) NOT NULL,
    `user_email` VARCHAR(255) NOT NULL UNIQUE,
    `user_password_hash` VARCHAR(255) NOT NULL,
    `user_permissions` TINYINT NOT NULL DEFAULT 0,
    `user_avatar_url` VARCHAR(255) NOT NULL DEFAULT '/assets/images/avatars/default.webp',
    `user_banner_color` VARCHAR(64) NOT NULL DEFAULT "[19,113,147]"
);
```
