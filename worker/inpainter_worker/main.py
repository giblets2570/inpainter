import pika
import json
from PIL import Image
from inpainter_worker.generator import generate_image
from tempfile import NamedTemporaryFile
from inpainter_worker.shape_filler import fill
from inpainter_worker.storage import upload_blob, download_blob
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import firestore

firebaseConfig = {
    "apiKey": "AIzaSyDhkWA2FK7anvmRju7JcmklHROPSTFK6co",
    "authDomain": "inpainter-a8631.firebaseapp.com",
    "projectId": "inpainter-a8631",
    "databaseURL": 'https://inpainter-a8631.firebaseio.com',
    "storageBucket": "inpainter-a8631.appspot.com",
    "messagingSenderId": "363570674075",
    "appId": "1:363570674075:web:cbfbb310aef1f4adf1893e",
    "measurementId": "G-JB6NKW84JK"
}


def process_job(job_id, app):
    # load the doc into here
    db = firestore.client(app=app)
    doc_ref = db.collection('jobs').document(job_id)
    doc = doc_ref.get().to_dict()

    # download both images
    with NamedTemporaryFile('wb', delete=False, suffix='.jpg') as fp:
        image_path = fp.name
        bucket_name, source_blob_name = doc['imageUri'].split('/', 1)
        download_blob(bucket_name, source_blob_name, image_path)

    with NamedTemporaryFile('wb', delete=False, suffix='.jpg') as fp:
        mask_path = fp.name
        bucket_name, source_blob_name = doc['maskUri'].split('/', 1)
        download_blob(bucket_name, source_blob_name, mask_path)

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
    dest_blob_name = source_blob_name.replace('/masks/', '/results/')
    upload_blob(bucket_name, saved_filepath, dest_blob_name)

    new_doc = {**doc, 'resultUri': f'{bucket_name}/{dest_blob_name}',
               'status': 'COMPLETED'}

    db.collection('jobs').document(job_id).set(new_doc)


def main():
    load_dotenv()
    RABBITMQ_URL = os.environ.get('RABBITMQ_URL')
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    print('created connection')

    channel = connection.channel()
    print('created channel')

    app = firebase_admin.initialize_app(options=firebaseConfig)

    for method_frame, properties, body in channel.consume('job_request'):
        if method_frame is None:
            print('no messages')
        # Display the message parts and acknowledge the message
        channel.basic_ack(method_frame.delivery_tag)

        job_id = body.decode()
        process_job(job_id, app)


if __name__ == '__main__':
    main()

    # job_id = 'S1fbnD2ZBcl5zx6yICEl'

    # result = process_job(job_id, app)

    # print(result)
