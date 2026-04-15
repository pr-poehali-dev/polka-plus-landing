import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

TABLES = {
    'employees': 'safety_employees',
    'checks': 'safety_checks',
    'ppe': 'safety_ppe',
    'docs': 'safety_docs',
}


def conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}


def handler(event: dict, context) -> dict:
    """CRUD для охраны труда: сотрудники, чек-листы, СИЗ, документы."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    section = params.get('section', '')
    record_id = params.get('id')

    if section not in TABLES:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown section'})}

    table = TABLES[section]
    body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}

    c = conn()
    cur = c.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            cur.execute(f'SELECT * FROM {table} ORDER BY created_at ASC')
            rows = [dict(r) for r in cur.fetchall()]
            return ok(rows)

        elif method == 'POST':
            if section == 'employees':
                cur.execute(
                    'INSERT INTO safety_employees (name, position, briefing, ppe, medical, next_briefing, comment) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING *',
                    (body.get('name',''), body.get('position',''), body.get('briefing', False),
                     body.get('ppe', False), body.get('medical', False),
                     body.get('next_briefing') or None, body.get('comment',''))
                )
            elif section == 'checks':
                cur.execute(
                    'INSERT INTO safety_checks (text, done) VALUES (%s,%s) RETURNING *',
                    (body.get('text',''), body.get('done', False))
                )
            elif section == 'ppe':
                cur.execute(
                    'INSERT INTO safety_ppe (name, type, issued, issued_at) VALUES (%s,%s,%s,%s) RETURNING *',
                    (body.get('name',''), body.get('type',''), body.get('issued', False),
                     body.get('issued_at') or None)
                )
            elif section == 'docs':
                cur.execute(
                    'INSERT INTO safety_docs (title, url) VALUES (%s,%s) RETURNING *',
                    (body.get('title',''), body.get('url',''))
                )
            row = dict(cur.fetchone())
            c.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps(row, default=str)}

        elif method == 'PUT':
            if section == 'employees':
                cur.execute(
                    'UPDATE safety_employees SET name=%s, position=%s, briefing=%s, ppe=%s, medical=%s, next_briefing=%s, comment=%s WHERE id=%s RETURNING *',
                    (body.get('name',''), body.get('position',''), body.get('briefing', False),
                     body.get('ppe', False), body.get('medical', False),
                     body.get('next_briefing') or None, body.get('comment',''), record_id)
                )
            elif section == 'checks':
                cur.execute(
                    'UPDATE safety_checks SET text=%s, done=%s WHERE id=%s RETURNING *',
                    (body.get('text',''), body.get('done', False), record_id)
                )
            elif section == 'ppe':
                cur.execute(
                    'UPDATE safety_ppe SET name=%s, type=%s, issued=%s, issued_at=%s WHERE id=%s RETURNING *',
                    (body.get('name',''), body.get('type',''), body.get('issued', False),
                     body.get('issued_at') or None, record_id)
                )
            elif section == 'docs':
                cur.execute(
                    'UPDATE safety_docs SET title=%s, url=%s WHERE id=%s RETURNING *',
                    (body.get('title',''), body.get('url',''), record_id)
                )
            row = dict(cur.fetchone())
            c.commit()
            return ok(row)

        elif method == 'DELETE':
            cur.execute(f'DELETE FROM {table} WHERE id=%s', (record_id,))
            c.commit()
            return ok({'ok': True})

    finally:
        cur.close()
        c.close()

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Bad request'})}
