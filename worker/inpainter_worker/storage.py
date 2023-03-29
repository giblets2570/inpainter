from firebase_admin.storage import _StorageClient


def download_blob(app, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = _StorageClient.from_app(app)

    bucket = storage_client.bucket()

    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)


def upload_blob(app, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    storage_client = _StorageClient.from_app(app)
    bucket = storage_client.bucket()
    blob = bucket.blob(destination_blob_name)
    generation_match_precondition = 0

    blob.upload_from_filename(
        source_file_name, if_generation_match=generation_match_precondition)
