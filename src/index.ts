import cli from "./cli.js";
import colors from "colors";

console.log(colors.yellow(`                                                
 _____ __  __ ____  _     _____   _______ _____ 
| ____|  \\/  |  _ \\| |   / _ \\ \\ / | ____| ____|
|  _| | |\\/| | |_) | |  | | | \\ V /|  _| |  _|  
| |___| |  | |  __/| |__| |_| || | | |___| |___ 
|_____|_|  |_|_|   |_____\\___/ |_| |_____|_____|
 _____ ____     _    ____ _  _______ ____       
|_   _|  _ \\   / \\  / ___| |/ | ____|  _ \\      
  | | | |_) | / _ \\| |   | ' /|  _| | |_) |     
  | | |  _ < / ___ | |___| . \\| |___|  _ <      
  |_| |_| \\_/_/   \\_\\____|_|\\_|_____|_| \\_\\     
                                               `));

cli.mainMenu();