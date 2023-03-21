const Rascal = require('rascal');
const config = require('./config');
const { memory } = require('../utils')
const pub = Object.keys(config.vhosts['/'].publications)[0]
const pubQueue = config.vhosts['/'].queues[0]
const sub = Object.keys(config.vhosts['/'].subscriptions)[0]

const createBrokerPromise = Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(config))

const sendMessage = async (message) => {
    try {
        const broker = await createBrokerPromise
        await broker.publish(pub, message, pubQueue);
        return { message: 'success' }
    } catch (err) {
        throw Error(`Error creating the job: ${String(err)}`)
    }
}

const receiveMessages = async () => {
    const broker = await createBrokerPromise
    try {
        const subscription = await broker.subscribe(sub);
        subscription
            .on('message', function (message, content, ackOrNack) {
                ackOrNack();
                content = JSON.parse(content)
                memory[content.job_id].status = 'SUCCESS'
                memory[content.job_id].finished_filepath = content.filepath
            })
            .on('error', console.error);
        console.log('Started rabbitmq listening')
    } catch (err) {
        console.error(err);
        throw err
    }
}

module.exports = { sendMessage, receiveMessages }