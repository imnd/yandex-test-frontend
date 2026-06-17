FROM --platform=linux/amd64 node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG VITE_API_URL
ARG VITE_SANCTUM_CSRF_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SANCTUM_CSRF_URL=$VITE_SANCTUM_CSRF_URL
ARG CACHE_BUST=3
RUN echo $CACHE_BUST
COPY . .
RUN cat .env.production
RUN npm run build

FROM --platform=linux/amd64 nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]