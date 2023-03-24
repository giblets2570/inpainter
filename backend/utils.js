const multer = require('multer');
const { createClient } = require('redis');

const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/') // directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // unique filename for uploaded file
    }
});



class Memory {
    constructor() { }
    async get(jobId) {
        const redisClient = createClient();
        await redisClient.connect()
        const mem = await redisClient.get(jobId)
        await redisClient.disconnect()
        const memObj = JSON.parse(mem)
        return memObj
    }
    async set(jobId, data) {
        const redisClient = createClient();
        await redisClient.connect()
        await redisClient.set(jobId, JSON.stringify(data))
        await redisClient.disconnect()
    }
}

const memory = new Memory()

const upload = multer({ storage: storage });
module.exports = { upload, memory, redisClient }

