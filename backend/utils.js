const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/') // directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // unique filename for uploaded file
    }
});

const memory = {}

const upload = multer({ storage: storage });
module.exports = { upload, memory }

