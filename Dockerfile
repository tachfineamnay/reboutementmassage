FROM nginx:alpine

# Copie des fichiers du projet dans le dossier par défaut de Nginx
COPY . /usr/share/nginx/html

# Modification du port par défaut de Nginx pour 3000 (comme configuré dans Coolify)
RUN sed -i 's/listen\(.*\)80;/listen 3000;/' /etc/nginx/conf.d/default.conf

# Exposition du port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
