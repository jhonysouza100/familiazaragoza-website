FROM nginx:latest

# Copia los archivos del directorio 'src' al directorio de origen
COPY ./src /usr/share/nginx/html/site/src
# Copia los archivos del directorio 'public' al directorio de origen
COPY ./public /usr/share/nginx/html/site/public
# Copia tu archivo de configuración de NGINX personalizado
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80