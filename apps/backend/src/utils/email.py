"""Email sending utilities."""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from loguru import logger

from src.core.config import settings

async def send_otp_email(to_email: str, otp_code: str) -> bool:
    """Send OTP code via email.
    
    Args:
        to_email: Recipient email address
        otp_code: OTP code to send
        
    Returns:
        bool: True if email sent successfully
    """
    message = MIMEMultipart()
    message["From"] = settings.SMTP_USER
    message["To"] = to_email
    message["Subject"] = "Your OTP Code"

    body = f"""
    Hello,

    Your OTP code is: {otp_code}
    
    This code will expire in 5 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    Your Application Team
    """
    
    message.attach(MIMEText(body, "plain"))
    
    try:
        if settings.SMTP_SSL:
            # Use SSL (port 465)
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        else:
            # Use STARTTLS (port 587)
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True
            )
        logger.info(f"OTP email sent to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email: {str(e)}")
        return False

async def send_budget_alert_email(to_email: str, alert_type: str, details: dict) -> bool:
    """Send budget alert notification via email.

    Args:
        to_email: Recipient email address
        alert_type: Type of alert ('threshold' or 'exceeded')
        details: Dictionary with alert details (scope_type, scope_id, current_usage, budget, percentage)

    Returns:
        bool: True if email sent successfully
    """
    message = MIMEMultipart()
    message["From"] = settings.SMTP_USER
    message["To"] = to_email

    scope_type = details.get("scope_type", "")
    scope_id = details.get("scope_id", "")
    current_usage = details.get("current_usage_usd", 0)
    budget = details.get("budget_usd", 0)
    percentage = details.get("percentage", 0)

    if alert_type == "threshold":
        message["Subject"] = f"⚠️ Budget Alert: {percentage:.1f}% Used"
        body = f"""
Hello,

This is an automated alert to notify you that your usage budget is approaching its limit.

Budget Details:
- Scope: {scope_type.title()} ({scope_id})
- Current Usage: ${current_usage:.2f}
- Budget Limit: ${budget:.2f}
- Percentage Used: {percentage:.1f}%

Please review your usage to avoid service interruptions.

You can monitor your usage in the dashboard or adjust your budget as needed.

Best regards,
ChasmX Platform
        """
    else:  # exceeded
        message["Subject"] = f"🚨 Budget Exceeded: {scope_type.title()}"
        body = f"""
Hello,

This is an urgent notification that your usage budget has been exceeded.

Budget Details:
- Scope: {scope_type.title()} ({scope_id})
- Current Usage: ${current_usage:.2f}
- Budget Limit: ${budget:.2f}
- Overage: ${current_usage - budget:.2f}

Action Required:
To continue using the service, please:
1. Review your current usage in the dashboard
2. Increase your budget limit, or
3. Optimize your workflows to reduce costs

Some features may be temporarily restricted until this is resolved.

Best regards,
ChasmX Platform
        """

    message.attach(MIMEText(body, "plain"))

    try:
        if settings.SMTP_SSL:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        else:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True
            )
        logger.info(f"Budget alert email ({alert_type}) sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send budget alert email: {str(e)}")
        return False

async def send_generic_alert_email(to_email: str, subject: str, body: str) -> bool:
    """Send a generic alert email.

    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body text

    Returns:
        bool: True if email sent successfully
    """
    message = MIMEMultipart()
    message["From"] = settings.SMTP_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        if settings.SMTP_SSL:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True
            )
        else:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True
            )
        logger.info(f"Alert email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send alert email: {str(e)}")
        return False