import pika
import json
from PIL import Image
from inpainter_worker.generator import generate_image
from tempfile import NamedTemporaryFile
import numpy as np
from copy import deepcopy
from inpainter_worker.shape_filler import fill

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
    mask = fill(Image.open(body['maskFile']).resize(512, 512))

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
