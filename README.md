# README

## About

This is the official Wails React-TS template.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Configuration

### MongoDB Configuration

The application uses a YAML-based configuration file for MongoDB settings located at `~/.config/neon/config.yaml` (on Unix systems) or the equivalent on other platforms.

When you first run the application, it will automatically create a default `config.yaml` file with placeholder values. You can modify this file to configure your MongoDB connection.

Example `config.yaml` structure:
```yaml
# MongoDB Configuration
host: "localhost"
port: 27017
app_name: "neon"
database: "neon"
username: "your_mongodb_username"
password: "your_mongodb_password"
ssl_enabled: false
```

### Environment Variable Override

For security or deployment purposes, you can still override any MongoDB configuration using environment variables:

- `MONGO_HOST`
- `MONGO_USERNAME` 
- `MONGO_PASSWORD`
- `MONGO_APP_NAME`
- `MONGO_DATABASE`

Environment variables take precedence over the configuration file.

### Database Locations

- **MongoDB Config**: `~/.config/neon/config.yaml`
- **SQLite Database**: `~/.config/neon/data/oxygen.db`
- **CloverDB Database**: `~/.config/neon/data/titanium/`
- **Logs**: `~/.cache/neon/logs/app.log`

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.
