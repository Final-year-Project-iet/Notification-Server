exports.alertNotificationEmail = (name, alertType, alertMessage, timeOfAlert) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alert Notification</title>
        <style>
            body {
                background-color: #f4f4f4;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 16px;
                color: #333333;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-align: center;
                border: 2px solid #e63946; /* Added border */
            }

            .logo {
                max-width: 120px;
                margin-bottom: 20px;
            }

            .message {
                font-size: 22px;
                font-weight: 700;
                color: #e63946;
                margin-bottom: 20px;
            }

            .body {
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
                margin-bottom: 20px;
            }

            .alert-type {
                font-size: 20px;
                font-weight: bold;
                color: #d62828;
                margin-bottom: 15px;
            }

            .alert-message {
                font-size: 16px;
                color: #333333;
                margin-bottom: 20px;
            }

            .timestamp {
                font-size: 14px;
                color: #888888;
                margin-bottom: 20px;
            }

            .highlight {
                color: #1d3557;
                font-weight: bold;
            }

            .cta {
                display: inline-block;
                padding: 12px 25px;
                background-color: #457b9d;
                color: #ffffff;
                text-decoration: none;
                border-radius: 25px;
                font-size: 16px;
                margin-top: 20px;
                transition: background-color 0.3s ease;
            }

            .cta:hover {
                background-color: #1d3557;
            }

            .support {
                font-size: 14px;
                color: #888888;
                margin-top: 30px;
                text-align: center;
            }

            .support a {
                color: #457b9d;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="https://your-website.com">
                <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="Your Company Logo">
            </a>
            <div class="message">🚨 Alert Notification: ${alertType}</div>
            <div class="body">
                <p>Hello ${name},</p>
                <p>We have detected the following alert:</p>
                <p class="alert-type">${alertType}</p>
                <p class="alert-message">${alertMessage}</p>
                <p class="timestamp">Time of Alert: <span class="highlight">${timeOfAlert}</span></p>
                <a href="https://your-website.com/login" class="cta">View Details</a>
            </div>
            <div class="support">
                If you have any questions, contact us at <a href="mailto:support@your-website.com">support@your-website.com</a>.
            </div>
        </div>
    </body>
    </html>`;
};
