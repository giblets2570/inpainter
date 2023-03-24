const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { upload, memory } = require('../utils')
const { sendMessage } = require('../queue');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/', upload.array('images[]', maxCount = 2), async function (req, res, next) {
  const imageFilepath = req.files.filter((file) => !file.path.includes('mask'))[0].path
  const maskFilepath = req.files.filter((file) => file.path.includes('mask'))[0].path
  const jobId = uuidv4()
  const payload = { imageFile: imageFilepath, maskFile: maskFilepath, prompt: req.body.prompt, jobId }
  await sendMessage(JSON.stringify(payload))

  await memory.set(jobId, {
    status: 'PENDING',
    payload: payload
  })
  res.json({ message: 'success', ...payload });
});

router.get('/job/:jobId', async function (req, res, next) {
  const jobId = req.params.jobId
  try {
    const memObj = await memory.get(jobId)
    if (memObj.status == 'PENDING') {
      return res.json({ message: 'Pending' })
    }
    return res.sendFile(memObj.finished_filepath)
  } catch (e) {
    console.log(e)
    return res.status(404).json({ message: `There is no job with ${jobId}` })
  }
});


module.exports = router;
