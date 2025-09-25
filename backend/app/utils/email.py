"""Email sending utilities."""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from loguru import logger

from app.core.config import settings

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