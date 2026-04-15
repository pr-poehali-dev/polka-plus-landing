import json
import os
import psycopg2  # noqa
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Краткая сводка: оплачены-не отгружены и не оплачены-не отгружены."""
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
            cur.execute("SELECT * FROM summary_records ORDER BY category, contractor, invoice_date ASC")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(list(rows), default=str)}

        elif method == 'POST':
            cur.execute(
                "INSERT INTO summary_records (category, contractor, invoice_date, amount, is_paid, is_shipped, subtotal, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                (body.get('category', 'paid_not_shipped'), body['contractor'], body.get('invoice_date'),
                 body.get('amount', 0), body.get('is_paid', False), body.get('is_shipped', False),
                 body.get('subtotal'), body.get('notes', ''))
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'PUT':
            cur.execute(
                "UPDATE summary_records SET category=%s, contractor=%s, invoice_date=%s, amount=%s, is_paid=%s, is_shipped=%s, subtotal=%s, notes=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                (body.get('category', 'paid_not_shipped'), body['contractor'], body.get('invoice_date'),
                 body.get('amount', 0), body.get('is_paid', False), body.get('is_shipped', False),
                 body.get('subtotal'), body.get('notes', ''), record_id)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'DELETE':
            cur.execute("DELETE FROM summary_records WHERE id = %s", (record_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()

    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Bad request'})}
