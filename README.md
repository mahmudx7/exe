<img
src="https://i.imgur.com/XN11Cm1.jpeg" alt="banner">

<h1 align="center">
  <img src="https://i.imgur.com/ZfuZrPc.jpeg" width="22px" alt="icon">
  Messenger Bot Commands Store by MahMUD.
</h1>


If you find any issues, please report them!


𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: <a href="https://www.facebook.com/mahmud.x07" style="color: black;">Mah M UD</a></h3></div>

<p align="center"><a href="fb link" target="_blank" rel="noopener noreferrer">
  <img src="https://i.imgur.com/M6xV2Np.jpeg" width="100" style="margin-right: 10px;"></a>
</p>
<h5 align="center">
>🎀 Mah MUD
</h5>
 


## Description
cmds is a command for GoatBot v2 that provides a paginated list of available commands stored in a remote JSON file. It allows users to search for commands by name, first letter, or page number. Users can also retrieve command URLs.

## Command Information
- **Name:** cmds
- **Author:** MahMUD
- **Version:** 1.7
- **Category:** General
- **Role Required:** 0 (Everyone)
- **Cooldown:** 3 seconds

## Features
✅ View all available commands with pagination  
✅ Search commands by name or starting letter  
✅ Retrieve command details (author, last update)  
✅ Get the command’s URL by replying with its number  

## Usage

### Detailed Usage Instructions:
#### 1. **View the first page of commands**


- Displays the first 10 commands along with their author and last update.  
- Includes pagination details and a tip to see the next page.

#### 2. **View a specific page (e.g., page 2)**


- Shows the next set of 10 commands.  
- If the page number is invalid, an error message is displayed.

#### 3. **Search for a command by its full name**


- Returns details of the command if found.  
- If no matching command exists, it returns an error message.

#### 4. **Search commands starting with a specific letter**




- Displays all commands that start with "a".  
- If no commands match, it returns an error.

#### 5. **Retrieve a command’s URL**  
- After running `!cmds`, reply with the command number to get its URL.
- Example:
  ```
  !cmds
  ```
  *Bot response:*  
  ```
  ╭─‣ 1: jan
  ├‣ Author: MahMUD
  ├‣ Update: 21-03-2025
  ╰────────────◊
  ```
  - Reply with 1 to get the URL for "jan".

## Example OutputOutput


## Dependencies
- [`axios`](https://www.npmjs.com/package/axios) - Used to fetch the command list and URLs from GitHub.

## Installation
1. Make sure `axios` is installed in your project:


2. Add the `cmds` command file to your GoatBot `commands` directory.

## Notes
- The command fetches data from:  
- Commands List: [`CMDSRUL.json`](https://raw.githubusercontent.com/mahmudx7/exe/main/CMDSRUL.json)  
- Command URLs: [`CMDS.json`](https://raw.githubusercontent.com/mahmudx7/exe/main/CMDS.json)  
- If a command is not found, an error message is shown.
- Pagination ensures that only 10 commands are displayed per page.

---

**Maintained by:** MahMUD  
If you find any issues, please report them!

𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: <a href="https://www.facebook.com/mahmud0x7" style="color: black;">MahMUD</a></h3></div>

