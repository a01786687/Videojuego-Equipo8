# Anura

## Authors

- Renata Uruchurtu
- Carlos Rosete
- Emilio Torres

A 2D roguelite platformer where a small frog fights its way up the food chain in a swamp.

---

## Requirements

Before running the game, make sure you have the following installed:

- **Node.js** (v18 or higher) — https://nodejs.org/en/download
- **MySQL** (v8 or higher):
  - Linux: https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/linux-installation.html
  - Windows: https://dev.mysql.com/downloads/installer/
- **A browser** (Chrome recommended)

### Installing Node.js

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Windows:**

Download and run the installer from https://nodejs.org/en/download. Make sure to check the box that says "Add to PATH" during installation.

Verify the installation:
```bash
node --version
npm --version
```

### Installing MySQL

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

After running `mysql_secure_installation`, follow the prompts. You can set a root password or leave it empty — just remember what you choose, you will need it later.

**Windows:**

Download MySQL Installer from https://dev.mysql.com/downloads/installer/ and run it. Select **MySQL Server** during setup. You will be asked to set a root password during installation — remember it for later.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/a01786687/Videojuego-Equipo8.git
cd Videojuego-Equipo8
```

### 2. Set up the database

Connect to MySQL from the terminal:

**Linux:**
```bash
mysql -u root -p
```

**Windows:**
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Enter your root password when prompted. If you set no password, just press Enter.

Once inside MySQL, run the schema and seed files:

```sql
source Anura/anura-schema.sql
source Anura/anura-seed.sql
exit
```

> If MySQL can't find the files, use the full path. For example on Linux:
> `source /home/youruser/Videojuego-Equipo8/Anura/anura-schema.sql`
>
> On Windows:
> `source C:/Users/youruser/Videojuego-Equipo8/Anura/anura-schema.sql`

### 3. Configure the database connection

Open `anura-server/db.js` and find the connection pool:

```js
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',   // <-- enter your MySQL password here, or leave empty if you have none
    database: 'anura'
})
```

Change the `password` field to match the MySQL root password you set during installation.

### 4. Install backend dependencies

```bash
cd anura-server
npm install
```

### 5. Start the backend server

From inside the `anura-server` folder:

```bash
node app_anura.js
```

You should see the server running on port 8080. Leave this terminal open while playing.

### 6. Open the game

Open `Anura/index.html` in your browser. The game requires a local server — opening the file directly will not work.

The easiest way is to use the **Live Server** extension in VS Code:
1. Open the `Videojuego-Equipo8` folder in VS Code
2. Install the Live Server extension if you don't have it: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
3. Right click `Anura/index.html`
4. Select **Open with Live Server**

---

## Controls

| Action | Key |
|---|---|
| Move left | A |
| Move right | D |
| Aim tongue up | W |
| Jump | Spacebar |
| Dash | J |
| Attack (tongue) | I |
| Pause | Esc |
| Use movement card | 1 |
| Use combat card | 2 |
| Use utility card | 3 |
| Toggle hitboxes | Y |

---

## How to Play

1. On the title screen, register or log in, then click **New Game**
2. Move through the procedurally generated level collecting mosquitos
3. Reach the cave entrance at the end of the level to fight the first boss
4. After defeating the boss, complete level 2 and reach the exit door to fight the final boss
5. Between runs, spend mosquitos on cards at the card selection screen
6. Cards are divided into three slots — Movement (1), Combat (2) and Utility (3)

---

## Project Structure

```
Videojuego-Equipo8/
├── Anura/                  # Game frontend
│   ├── index.html
│   ├── anura-schema.sql    # Database schema
│   ├── anura-seed.sql      # Initial data (cards, mobs, etc.)
│   ├── js/
│   │   ├── entities/       # Frog, Enemy, SnakeBoss, EagleBoss
│   │   ├── scenes/         # playScene, bossScene1, bossScene2, etc.
│   │   ├── systems/        # camera, collisions, hud, levelGenerator
│   │   └── libs/           # Base classes, levels, game functions
│   └── assets/             # Sprites, music, card images
└── anura-server/           # Node.js backend
    ├── app_anura.js        # Express server (runs on port 8080)
    └── db.js               # MySQL connection and query functions
```