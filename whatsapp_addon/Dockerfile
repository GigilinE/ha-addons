ARG BUILD_FROM
FROM ${BUILD_FROM}

RUN apk update && apk upgrade && apk add --no-cache git npm nodejs

COPY . /
RUN chmod a+x /run.sh
RUN chmod a+x /finish.sh

# Build Baileys (TypeScript to JS)
RUN cd /Baileys && npm install && npm run build

# Install addon dependencies
RUN npm install -f

EXPOSE 3000
CMD [ "/run.sh" ]
