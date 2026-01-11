FROM php:8.2-cli

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Setup Working Dir
WORKDIR /var/www

# 4. Copy File Project Kamu
COPY . .

# 5. Install Dependencies (PENTING!)
# Kita install di dalam image supaya siap pakai
RUN composer install --no-dev --optimize-autoloader

# 6. Expose Port
EXPOSE 8000

# 7. Jalankan Server (Arahkan ke public)
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]