import pika
import json
from PIL import Image
from inpainter_worker.generator import generate_image
from tempfile import NamedTemporaryFile


connection = pika.BlockingConnection()
channel = connection.channel()


for method_frame, properties, body in channel.consume('job_request'):
    # Display the message parts and acknowledge the message
    channel.basic_ack(method_frame.delivery_tag)

    body = json.loads(body)

    image = Image.open(body['imageFile'])
    mask = Image.open(body['maskFile'])
    job_id = body['jobId']

    generated_image = generate_image(image, mask, body['prompt'])

    with NamedTemporaryFile('wb', delete=False, suffix='.png') as fp:
        generated_image.save(fp, format='png')
        saved_filepath = fp.name

    channel.basic_publish('', 'job_complete', json.dumps(
        {'filepath': saved_filepath, 'job_id': job_id}))
    # Escape out of the loop after 10 messages
    if method_frame.delivery_tag == 10:
        break

# Cancel the consumer and return any pending messages
requeued_messages = channel.cancel()
print('Requeued %i messages' % requeued_messages)
connection.close()
