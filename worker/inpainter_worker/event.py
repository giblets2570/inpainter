import firebase_admin
from firebase_admin import credentials, firestore, functions

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

db = firestore.client()


@functions.firestore.document('jobs/{docId}')
def on_document_created(event, context):
    # The event contains information about the document created.
    print(f"New document created: {event['name']}")
    print(f"Document fields: {event['value']['fields']}")
