import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта и отправляет письмо на почту владельца"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    body = json.loads(event.get('body') or '{}')
    name     = body.get('name', '').strip()
    phone    = body.get('phone', '').strip()
    goods    = body.get('goods', '').strip()
    comment  = body.get('comment', '').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Телефон обязателен'}, ensure_ascii=False),
        }

    resend_key = os.environ.get('RESEND_API_KEY', '')
    to_email   = os.environ.get('LEAD_EMAIL', 'polkapluss@yandex.ru')

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1A1228, #2D1640); padding: 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 22px;">📦 Новая заявка с сайта Полка+</h2>
      </div>
      <div style="background: #F8F9FC; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #E5E7EB; border-top: none;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px; width: 140px;">Имя:</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 14px;">{name or '—'}</td>
          </tr>
          <tr style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Телефон:</td>
            <td style="padding: 10px 0; color: #CB11AB; font-weight: 700; font-size: 16px;">{phone}</td>
          </tr>
          <tr style="border-top: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-size: 14px;">Тип товара:</td>
            <td style="padding: 10px 0; color: #111827; font-size: 14px;">{goods or '—'}</td>
          </tr>
          {"<tr style='border-top: 1px solid #E5E7EB;'><td style='padding: 10px 0; color: #6B7280; font-size: 14px; vertical-align: top;'>Комментарий:</td><td style='padding: 10px 0; color: #111827; font-size: 14px;'>" + comment + "</td></tr>" if comment else ""}
        </table>
        <div style="margin-top: 20px; padding: 12px 16px; background: #F0D6EC; border-radius: 8px; font-size: 13px; color: #9A0080;">
          Свяжитесь с клиентом как можно скорее — в течение 15 минут 🚀
        </div>
      </div>
    </div>
    """

    payload = json.dumps({
        'from': 'Полка+ <onboarding@resend.dev>',
        'to': [to_email],
        'subject': f'Новая заявка от {name or phone}',
        'html': html,
    }).encode()

    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={
            'Authorization': f'Bearer {resend_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка отправки', 'detail': err_body}),
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True}),
    }