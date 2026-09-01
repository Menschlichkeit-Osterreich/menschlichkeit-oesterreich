FROM node:20-alpine@sha256:42d1d5b07c84257b55d409f4e6e3be3b55d42867afce975a5648a3f231bf7e81 AS build
WORKDIR /app

# Build-time env for Vite
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY} \
    VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}

COPY package.json package-lock.json* .npmrc* ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine@sha256:d9083fe47768377ef55dedafd67d4da7c2f2bc2bece7554954f29359deb0dce9 AS runner
# nginx-unprivileged laeuft per Default als non-root User "nginx" (UID 101) und
# lauscht auf 8080 statt 80 (CIS Docker Benchmark 4.1 / Trivy DS-0002).
# Damit passen EXPOSE und HEALTHCHECK erstmals zum tatsaechlichen Listen-Port.
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
# Expliziter non-root USER: DS-0002 wertet die Dockerfile-Instruktionen statisch
# aus und kennt den Default-User des Basis-Image nicht. UID 101 = "nginx".
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

