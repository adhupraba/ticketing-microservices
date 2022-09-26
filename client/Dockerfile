FROM alpine AS builder

RUN apk update && apk upgrade && apk add --no-cache --update nodejs yarn

WORKDIR /app

COPY package.json yarn.lock ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

COPY ./ ./

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build && rm -rf node_modules && yarn install --production --frozen-lockfle --ignore-scripts --prefer-offline

######################

FROM alpine AS runner

RUN apk update && apk upgrade && apk add --no-cache --update nodejs yarn

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -g 1001 -S nodejs

RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD [ "yarn", "start" ]
