FROM alpine:3.9

ENV TERM=linux

RUN apk add --no-cache bash mongodb

RUN mkdir -p /data/db && \
    chown -R mongodb /data/db

WORKDIR /etc
COPY ./repl_set_startup.sh .

RUN sh repl_set_startup.sh

CMD [ "mongod", "--replSet", "rs0", "--bind_ip_all"]
