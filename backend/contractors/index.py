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

    def g(k):
        return body.get(k, '') or ''

    try:
        if method == 'GET':
            cur.execute("SELECT * FROM contractors ORDER BY name ASC")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(list(rows), default=str)}

        elif method == 'POST':
            cur.execute("""
                INSERT INTO contractors
                  (name, inn, ogrn, kpp, legal_address, actual_address,
                   bank_name, bank_corr_account, bank_bik, bank_account, bank_inn, bank_kpp,
                   director, contact_person, email, phone, website, notes)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING *
            """, (g('name'), g('inn'), g('ogrn'), g('kpp'), g('legal_address'), g('actual_address'),
                  g('bank_name'), g('bank_corr_account'), g('bank_bik'), g('bank_account'), g('bank_inn'), g('bank_kpp'),
                  g('director'), g('contact_person'), g('email'), g('phone'), g('website'), g('notes')))
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(dict(row), default=str)}

        elif method == 'PUT':
            cur.execute("""
                UPDATE contractors SET
                  name=%s, inn=%s, ogrn=%s, kpp=%s, legal_address=%s, actual_address=%s,
                  bank_name=%s, bank_corr_account=%s, bank_bik=%s, bank_account=%s, bank_inn=%s, bank_kpp=%s,
                  director=%s, contact_person=%s, email=%s, phone=%s, website=%s, notes=%s,
                  updated_at=NOW()
                WHERE id=%s RETURNING *
            """, (g('name'), g('inn'), g('ogrn'), g('kpp'), g('legal_address'), g('actual_address'),
                  g('bank_name'), g('bank_corr_account'), g('bank_bik'), g('bank_account'), g('bank_inn'), g('bank_kpp'),
                  g('director'), g('contact_person'), g('email'), g('phone'), g('website'), g('notes'), record_id))
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
