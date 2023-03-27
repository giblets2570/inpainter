const Rascal = require('rascal');
const config = require('./config');
const pub = Object.keys(config.vhosts['/'].publications)[0]
const pubQueue = config.vhosts['/'].queues[0]

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


module.exports = { sendMessage }