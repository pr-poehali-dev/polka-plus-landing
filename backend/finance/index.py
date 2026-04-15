import json
import os
import psycopg2  # noqa
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Управление финансовыми данными: дебиторка, кредиторка, календарь платежей, регулярные платежи."""
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
    section = params.get('section', 'receivables')
    record_id = params.get('id')

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        table_map = {
            'receivables': 'receivables',
            'payables': 'payables',
            'calendar': 'payment_calendar',
            'regular': 'regular_payments'
        }
        table = table_map.get(section, 'receivables')

        if method == 'GET':
            cur.execute(f"SELECT * FROM {table} ORDER BY id DESC")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(list(rows), default=str)}

        elif method == 'POST':
            if section == 'receivables':
                cur.execute(
                    "INSERT INTO receivables (contractor, amount, due_date, description, status) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                    (body['contractor'], body['amount'], body.get('due_date'), body.get('description', ''), body.get('status', 'active'))
                )
            elif section == 'payables':
                cur.execute(
                    "INSERT INTO payables (contractor, amount, due_date, description, status) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                    (body['contractor'], body['amount'], body.get('due_date'), body.get('description', ''), body.get('status', 'active'))
                )
            elif section == 'calendar':
                cur.execute(
                    "INSERT INTO payment_calendar (contractor, amount, payment_date, description, type, is_paid, is_recurring, recurrence) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                    (body['contractor'], body['amount'], body['payment_date'], body.get('description', ''), body.get('type', 'expense'), body.get('is_paid', False), body.get('is_recurring', False), body.get('recurrence'))
                )
            elif section == 'regular':
                cur.execute(
                    "INSERT INTO regular_payments (name, contractor, amount, frequency, next_payment_date, description, is_active) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *",
                    (body['name'], body.get('contractor', ''), body['amount'], body['frequency'], body.get('next_payment_date'), body.get('description', ''), body.get('is_active', True))
                )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'PUT':
            if section == 'receivables':
                cur.execute(
                    "UPDATE receivables SET contractor=%s, amount=%s, due_date=%s, description=%s, status=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                    (body['contractor'], body['amount'], body.get('due_date'), body.get('description', ''), body.get('status', 'active'), record_id)
                )
            elif section == 'payables':
                cur.execute(
                    "UPDATE payables SET contractor=%s, amount=%s, due_date=%s, description=%s, status=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                    (body['contractor'], body['amount'], body.get('due_date'), body.get('description', ''), body.get('status', 'active'), record_id)
                )
            elif section == 'calendar':
                cur.execute(
                    "UPDATE payment_calendar SET contractor=%s, amount=%s, payment_date=%s, description=%s, type=%s, is_paid=%s, is_recurring=%s, recurrence=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                    (body['contractor'], body['amount'], body['payment_date'], body.get('description', ''), body.get('type', 'expense'), body.get('is_paid', False), body.get('is_recurring', False), body.get('recurrence'), record_id)
                )
            elif section == 'regular':
                cur.execute(
                    "UPDATE regular_payments SET name=%s, contractor=%s, amount=%s, frequency=%s, next_payment_date=%s, description=%s, is_active=%s, updated_at=NOW() WHERE id=%s RETURNING *",
                    (body['name'], body.get('contractor', ''), body['amount'], body['frequency'], body.get('next_payment_date'), body.get('description', ''), body.get('is_active', True), record_id)
                )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'DELETE':
            cur.execute(f"DELETE FROM {table} WHERE id = %s", (record_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()

    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Bad request'})}