import json
import os
import base64
import uuid
import psycopg2  # noqa
import boto3
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )


def handler(event: dict, context) -> dict:
    """Управление договорами: загрузка PDF/Word в S3, хранение метаданных в БД."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    record_id = params.get('id')
    contractor_filter = params.get('contractor')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            if contractor_filter:
                cur.execute("SELECT * FROM contracts WHERE contractor = %s ORDER BY created_at DESC", (contractor_filter,))
            else:
                cur.execute("SELECT * FROM contracts ORDER BY created_at DESC")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(list(rows), default=str)}

        elif method == 'POST':
            body = json.loads(event.get('body') or '{}')
            file_data = base64.b64decode(body['file_data'])
            file_name = body['file_name']
            contractor = body['contractor']
            title = body.get('title') or file_name
            notes = body.get('notes', '')
            file_type = body.get('file_type', 'application/octet-stream')
            file_size = len(file_data)

            ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'bin'
            key = f"contracts/{contractor}/{uuid.uuid4()}.{ext}"

            s3 = get_s3()
            s3.put_object(
                Bucket='files',
                Key=key,
                Body=file_data,
                ContentType=file_type,
                ContentDisposition=f'inline; filename="{file_name}"'
            )

            file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

            cur.execute(
                "INSERT INTO contracts (contractor, title, file_name, file_url, file_size, file_type, notes) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *",
                (contractor, title, file_name, file_url, file_size, file_type, notes)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'DELETE':
            cur.execute("SELECT file_url FROM contracts WHERE id = %s", (record_id,))
            row = cur.fetchone()
            if row:
                # Extract S3 key from URL
                url = row['file_url']
                key = url.split('/bucket/', 1)[-1] if '/bucket/' in url else None
                if key:
                    try:
                        s3 = get_s3()
                        s3.delete_object(Bucket='files', Key=key)
                    except Exception:
                        pass
                cur.execute("DELETE FROM contracts WHERE id = %s", (record_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()

    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Bad request'})}
