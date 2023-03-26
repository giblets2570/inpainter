import pika
import json
from PIL import Image
from inpainter_worker.generator import generate_image
from tempfile import NamedTemporaryFile
import numpy as np
from copy import deepcopy

params = pika.ConnectionParameters(heartbeat=600,
                                   blocked_connection_timeout=300)

connection = pika.BlockingConnection(params)
channel = connection.channel()


for method_frame, properties, body in channel.consume('job_request'):
    if method_frame is None:
        connection.heaty
    # Display the message parts and acknowledge the message
    channel.basic_ack(method_frame.delivery_tag)

    body = json.loads(body)

    image = Image.open(body['imageFile']).convert(
        "RGB").resize((512, 512)).rotate(-90, expand=True)
    mask = Image.open(body['maskFile']).resize((128, 128))

    # we need to fill in the mask
    ma = deepcopy(np.asarray(mask)[:, :, 3])
    x, y = np.where(ma > 0)
    coords = list(zip(x, y))

    for i in range(ma.shape[0]):
        in_shape = False
        in_line = False
        was_in_shape = False
        for j in range(ma.shape[1]):
            if (i, j) in coords:
                in_line = True
                ma[i][j] = 255
                if in_shape:
                    was_in_shape = True
                    in_shape = False
                continue
            if in_line:
                in_line = False
                if was_in_shape:
                    in_shape = False
                    was_in_shape = False
                else:
                    in_shape = True
            if in_shape:
                ma[i][j] = 255

    mask = Image.fromarray(ma).resize((512, 512))

    job_id = body['jobId']

    generated_image = generate_image(image, mask, body['prompt'])

    with NamedTemporaryFile('wb', delete=False, suffix='.png') as fp:
        generated_image.save(fp, format='png')
        saved_filepath = fp.name

    channel.basic_publish('', 'job_complete', json.dumps(
        {'filepath': saved_filepath, 'job_id': job_id}))

# Cancel the consumer and return any pending messages
requeued_messages = channel.cancel()
print('Requeued %i messages' % requeued_messages)
connection.close()
