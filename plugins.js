import path from 'path';

module.exports = (fastify) => {
    fastify.register(require('@fastify/static'), {
        root: path.join(__dirname, 'public'),
        prefix: '/public/'
    })
    fastify.register(require('@fastify/websocket'))
}