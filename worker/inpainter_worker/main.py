import pika
from PIL import Image
from .generator import generate_image
from tempfile import NamedTemporaryFile
from .shape_filler import fill
from .storage import upload_blob, download_blob
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import firestore, credentials
from pathlib import Path


def process_job(job_id, app):
    # load the doc into here
    db = firestore.client(app=app)
    doc_ref = db.collection('jobs').document(job_id)
    doc = doc_ref.get().to_dict()

    with NamedTemporaryFile('wb', delete=False, suffix='.jpg') as fp:
        image_path = fp.name
        bucket_name, source_blob_name = doc['imageUri'].split('/', 1)
        download_blob(app, source_blob_name, image_path)

    with NamedTemporaryFile('wb', delete=False, suffix='.jpg') as fp:
        mask_path = fp.name
        bucket_name, source_blob_name = doc['maskUri'].split('/', 1)
        download_blob(app, source_blob_name, mask_path)

    # create the image and mask Pillow objects
    image = Image.open(image_path).convert("RGB").resize(
        (512, 512)).rotate(-90, expand=True)
    mask = fill(Image.open(mask_path).convert("RGBA").resize((512, 512)))

    generated_image = generate_image(image, mask, doc['prompt'])

    with NamedTemporaryFile('wb', delete=False, suffix='.png') as fp:
        generated_image.save(fp, format='png')
        saved_filepath = fp.name

    # upload the job
    # replace the masks blob name
    bucket_name, mask_blob_name = doc['maskUri'].split('/', 1)
    dest_blob_name = mask_blob_name.replace('/masks/', '/results/')
    upload_blob(app, saved_filepath, dest_blob_name)

    new_doc = {**doc, 'resultUri': f'{bucket_name}/{dest_blob_name}',
               'status': 'COMPLETED'}

    db.collection('jobs').document(job_id).set(new_doc)

    # now delete all files
    Path(saved_filepath).unlink(missing_ok=True)
    Path(image_path).unlink(missing_ok=True)
    Path(mask_path).unlink(missing_ok=True)


def main():
    load_dotenv()
    RABBITMQ_URL = os.environ.get('RABBITMQ_URL')
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    print('created connection')

    cred = credentials.Certificate(
        str(Path(__file__).parent / "serviceAccountKey.json"))

    app = firebase_admin.initialize_app(cred)

    while True:
        channel = connection.channel()
        print('created channel')
        try:
            for method_frame, properties, body in channel.consume('job_request'):
                if method_frame is None:
                    print('no messages')
                # Display the message parts and acknowledge the message
                channel.basic_ack(method_frame.delivery_tag)

                job_id = body.decode()
                process_job(job_id, app)
        except pika.exceptions.StreamLostError:
            print('stream lost, restarting')


if __name__ == '__main__':
    main()
