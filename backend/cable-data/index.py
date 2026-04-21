import json
import os
import psycopg2  # noqa
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p21653320_polka_plus_landing'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Получает и сохраняет данные производственного калькулятора кабеля, включая расчёт цен"""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    # section может прийти как query param или в теле запроса
    body_raw = event.get('body') or '{}'
    body_pre = {}
    try:
        body_pre = json.loads(body_raw)
    except Exception:
        pass
    section = params.get('section') or body_pre.get('section', 'main')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── РАЗДЕЛ: расчёт цены (строки) ──────────────────────────────────────
        if section == 'pricing':
            if method == 'GET':
                cur.execute("SELECT * FROM pricing_rows ORDER BY created_at ASC")
                rows = cur.fetchall()
                cur.execute("SELECT value FROM pricing_settings WHERE key = 'global_hour_rate'")
                setting = cur.fetchone()
                return {
                    'statusCode': 200,
                    'headers': {**cors, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'rows': [dict(r) for r in rows],
                        'globalHourRate': setting['value'] if setting else ''
                    }, default=str),
                }

            if method == 'POST':
                body = body_pre
                action = body.get('action')

                if action == 'save_rows':
                    rows = body.get('rows', [])  # noqa
                    cur.execute("DELETE FROM pricing_rows")
                    for r in rows:
                        cur.execute(
                            """INSERT INTO pricing_rows (id, cable_id, norm_hours, hour_rate, cost_price)
                               VALUES (%s, %s, %s, %s, %s)
                               ON CONFLICT (id) DO UPDATE SET
                                 cable_id=EXCLUDED.cable_id,
                                 norm_hours=EXCLUDED.norm_hours,
                                 hour_rate=EXCLUDED.hour_rate,
                                 cost_price=EXCLUDED.cost_price,
                                 updated_at=NOW()""",
                            (r['id'], r['cableId'],
                             r['normHours'] if r['normHours'] != '' else None,
                             r['hourRate'] if r['hourRate'] != '' else None,
                             r['costPrice'] if r['costPrice'] != '' else None)
                        )
                    conn.commit()
                    return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

                if action == 'save_hour_rate':
                    rate = body.get('globalHourRate', '')
                    cur.execute(
                        """INSERT INTO pricing_settings (key, value, updated_at)
                           VALUES ('global_hour_rate', %s, NOW())
                           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()""",
                        (rate,)
                    )
                    conn.commit()
                    return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

        # ── РАЗДЕЛ: основные данные (кабели, материалы) ───────────────────────
        if method == 'GET':
            cur.execute(f"SELECT data FROM {SCHEMA}.cable_calculator_data WHERE key = 'main'")
            row = cur.fetchone()
            data = row['data'] if row and row['data'] else {}
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'data': data}, ensure_ascii=False),
            }

        if method == 'POST':
            body = body_pre
            data = body.get('data')
            if data is None:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'data required'})}
            cur.execute(
                f"""INSERT INTO {SCHEMA}.cable_calculator_data (key, data, updated_at)
                    VALUES ('main', %s, NOW())
                    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()""",
                (json.dumps(data, ensure_ascii=False),)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    finally:
        cur.close()
        conn.close()

    return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}