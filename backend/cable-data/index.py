import json
import os
import psycopg2  # noqa

SCHEMA = 't_p21653320_polka_plus_landing'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Получает и сохраняет данные производственного калькулятора кабеля"""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT data FROM {SCHEMA}.cable_calculator_data WHERE key = 'main'")
        row = cur.fetchone()
        cur.close()
        conn.close()
        data = row[0] if row and row[0] else {}
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'data': data}, ensure_ascii=False),
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        data = body.get('data')
        if data is None:
            return {
                'statusCode': 400,
                'headers': cors,
                'body': json.dumps({'error': 'data required'}),
            }
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.cable_calculator_data (key, data, updated_at)
            VALUES ('main', %s, NOW())
            ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
            """,
            (json.dumps(data, ensure_ascii=False),)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
        }

    return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}