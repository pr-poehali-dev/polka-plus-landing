import json
import os
import psycopg2  # noqa
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Управление справочником контрагентов: CRUD."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    record_id = params.get('id')

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            cur.execute("SELECT * FROM contractors ORDER BY name ASC")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(list(rows), default=str)}

        elif method == 'POST':
            cur.execute(
                "INSERT INTO contractors (name, type, inn, phone, email, contact_person, address, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                (body['name'], body.get('type', 'both'), body.get('inn', ''), body.get('phone', ''),
                 body.get('email', ''), body.get('contact_person', ''), body.get('address', ''), body.get('notes', ''))
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'PUT':
            cur.execute(
                "UPDATE contractors SET name=%s, type=%s, inn=%s, phone=%s, email=%s, contact_person=%s, address=%s, notes=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                (body['name'], body.get('type', 'both'), body.get('inn', ''), body.get('phone', ''),
                 body.get('email', ''), body.get('contact_person', ''), body.get('address', ''), body.get('notes', ''), record_id)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'DELETE':
            cur.execute("DELETE FROM contractors WHERE id = %s", (record_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()

    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Bad request'})}
