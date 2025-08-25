FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ git
ENV CHOKIDAR_USEPOLLING=1
ENV WATCHPACK_POLLING=true

CMD sh -c 'if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then npm install; fi; npm run dev -- --host 0.0.0.0'
