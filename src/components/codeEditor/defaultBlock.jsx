const defaultheader = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notion-style Navbar</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 14px;
        }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background-color: #ffffff;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .logo {
            display: flex;
            align-items: center;
            font-weight: bold;
            font-size: 16px;
        }
        .logo img {
            width: 32px;
            height: 32px;
            margin-right: 8px;
        }
        .nav-links {
            display: flex;
            gap: 24px;
        }
        .nav-item {
            position: relative;
            cursor: pointer;
        }
        /* Add dropdown icon only to specific nav items */
        .nav-item.has-dropdown::after {
            content: "▾";
            margin-left: 4px;
            font-size: 12px;
        }
        .auth-buttons {
            display: flex;
            gap: 12px;
        }
        .btn {
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
        }
        .btn-secondary {
            color: #000000;
        }
        .btn-primary {
            background-color: #000000;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo">
            <img src="https://cdn-icons-png.flaticon.com/128/3600/3600955.png" alt="Techdoc logo">
            Tehdoc
        </div>
        <div class="nav-links">
            <div class="nav-item has-dropdown">Product</div>
            <div class="nav-item has-dropdown">Teams</div>
            <div class="nav-item">Individuals</div>
            <div class="nav-item">Download</div>
            <div class="nav-item">Pricing</div>
        </div>
        <div class="auth-buttons">
            <a href="#" class="btn btn-primary">Log in</a>
            <a href="#" class="btn btn-primary">Get Techdoc</a>
        </div>
    </nav>
</body>
</html>
`

const defaultfooter = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notion-style Footer</title>
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 14px;
            line-height: 1.5;
        }
        .footer {
            background-color: #f6f6f6;
            padding: 40px 20px;
            color: #050505;
        }
        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            font-size: 40px;
        }

    </style>
</head>
<body>
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; Techdoc 2024. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`

export { defaultheader, defaultfooter }
