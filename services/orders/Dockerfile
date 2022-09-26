FROM alpine

RUN apk update && apk upgrade && apk add --no-cache --update nodejs npm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock* package-lock.json* ./

RUN \
  if [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY ./ ./

CMD [ "npm", "start" ]